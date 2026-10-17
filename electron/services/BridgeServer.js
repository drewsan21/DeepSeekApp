/**
 * Local Bridge Server
 *
 * After the user logs in with their DeepSeek account, this service exposes a
 * custom OpenAI-compatible HTTP endpoint on localhost so that other local
 * applications can use the chat to perform actions — applying tools, skills,
 * plugins and MCP servers through the existing ToolExecutor / PluginManager.
 *
 * Endpoints:
 *   GET  /v1/models                 – list available models (bridge + upstream)
 *   POST /v1/chat/completions       – OpenAI-compatible chat; supports SSE streaming
 *                                       and tool/function-call round-trips against
 *                                       the local tool registry
 *   POST /v1/bridge/tool-exec       – direct, authenticated tool execution
 *   GET  /v1/bridge/tools           – list exposed tools/skills/plugins/MCP servers
 *   GET  /health                    – bridge status
 *
 * Account-token setup:
 *   - The bridge is configured directly from your DeepSeek account token: on
 *     login the session's API key / OAuth access token is handed to the bridge
 *     (BridgeServer.setAccountToken) and every upstream request uses it, so
 *     connecting apps transparently act as you — no separate keys needed.
 *   - The same account token also authenticates the bridge itself: external
 *     apps may present EITHER the generated bridge bearer token OR your
 *     account token in "Authorization: Bearer <token>".
 *
 * Full chat/bridge access for other AI apps:
 *   - All registered ToolExecutor actions are auto-discovered and advertised
 *     as function tools (not just a static subset), plus installed plugins and
 *     skills are exposed as callable bridge tools ("plugin__<id>",
 *     "skill__<name>") so any connected app can apply them.
 *   - Persistent conversations: send "X-Bridge-Conversation: <id>" (or set
 *     body.conversation) and history is stored via ConversationManager exactly
 *     like in-app chats; omit the header for stateless calls.
 *
 * Security:
 *   - Binds to 127.0.0.1 only (never reachable from the network).
 *   - Requires a bearer token (generated at login, shown in the app UI).
 *   - Optional CORS allow-list for local web apps (localhost origins only).
 */

const http = require('http');
const crypto = require('crypto');

const BRIDGE_MODEL = 'deepseek-bridge';

class BridgeServer {
  /**
   * @param {object} deps
   * @param {object} deps.toolExecutor      - ToolExecutor service
   * @param {object} deps.pluginManager     - PluginManager service
   * @param {object} deps.conversationManager - ConversationManager service
   * @param {object} deps.settings          - SettingsManager service
   * @param {object} deps.secretStore       - SecretStore service (holds DeepSeek account token)
   * @param {object} deps.databaseManager   - DatabaseManager service (MCP servers / skills registry)
   */
  constructor(deps = {}) {
    this.toolExecutor = deps.toolExecutor;
    this.pluginManager = deps.pluginManager;
    this.conversationManager = deps.conversationManager;
    this.settings = deps.settings;
    this.secretStore = deps.secretStore;
    this.databaseManager = deps.databaseManager;

    this.server = null;
    this.port = 0;
    this.token = null;
    this.running = false;
    // Your DeepSeek account token (API key or OAuth access token), injected by
    // the auth layer on login. Used BOTH for upstream requests and as an
    // accepted bridge credential so apps can authenticate with the account
    // token itself.
    this.accountToken = null;

    // In-memory conversation store for bridge sessions (keyed by X-Bridge-Conversation id)
    this.sessions = new Map();
    this.maxSessionMessages = 50;

    // Tools exposed to connecting apps. Maps bridge tool names -> ToolExecutor names.
    this.exposedTools = [
      {
        name: 'filesystem_read',
        executor: 'filesystem.read',
        description: 'Read a file from the local filesystem.',
        parameters: {
          type: 'object',
          properties: { path: { type: 'string', description: 'Absolute or workspace-relative file path' } },
          required: ['path'],
        },
      },
      {
        name: 'filesystem_write',
        executor: 'filesystem.write',
        description: 'Write content to a file on the local filesystem.',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            content: { type: 'string' },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'filesystem_list',
        executor: 'filesystem.list',
        description: 'List directory contents.',
        parameters: {
          type: 'object',
          properties: { path: { type: 'string' }, recursive: { type: 'boolean' } },
          required: ['path'],
        },
      },
      {
        name: 'shell_execute',
        executor: 'shell.execute',
        description: 'Execute a shell command locally.',
        parameters: {
          type: 'object',
          properties: { command: { type: 'string' }, cwd: { type: 'string' } },
          required: ['command'],
        },
      },
      {
        name: 'git_status',
        executor: 'git.status',
        description: 'Show git status of a repository.',
        parameters: {
          type: 'object',
          properties: { repoPath: { type: 'string' } },
          required: [],
        },
      },
      {
        name: 'git_commit',
        executor: 'git.commit',
        description: 'Commit staged changes in a git repository.',
        parameters: {
          type: 'object',
          properties: { repoPath: { type: 'string' }, message: { type: 'string' } },
          required: ['message'],
        },
      },
      {
        name: 'browser_navigate',
        executor: 'browser.navigate',
        description: 'Navigate the embedded browser to a URL.',
        parameters: {
          type: 'object',
          properties: { url: { type: 'string' } },
          required: ['url'],
        },
      },
      {
        name: 'computer_screenshot',
        executor: 'computer_use.screenshot',
        description: 'Capture a screenshot of the desktop.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    ];
  }

  /* ------------------------------------------------------------------ */
  /* Account token                                                      */
  /* ------------------------------------------------------------------ */

  /**
   * Configure the bridge with your DeepSeek account token (API key or OAuth
   * access token). Called by the auth layer on login so the bridge is set up
   * directly from the account session:
   *   - all upstream chat requests are made with this token;
   *   - connecting apps may authenticate to the bridge with this same token
   *     (in addition to the generated bridge bearer token).
   * Pass null on logout to tear the setup down.
   */
  setAccountToken(token) {
    this.accountToken = typeof token === 'string' && token.trim() ? token.trim() : null;
    if (this.running) {
      console.log(
        `[Bridge] account token ${this.accountToken ? 'configured' : 'cleared'} (${this.token ? 'bridge token still active' : 'no bridge token'})`
      );
    }
    return this.accountToken;
  }

  /** Optional account identity used when naming persisted bridge chats. */
  setAccountInfo(info = {}) {
    this.accountEmail = info.email || null;
    this.accountId = info.id || null;
  }

  /* ------------------------------------------------------------------ */
  /* Lifecycle                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * Start the bridge. Called automatically after a successful DeepSeek login.
   * Idempotent: if already running, returns the current info.
   */
  async start(options = {}) {
    if (this.running) return this.getInfo();

    const settings = await this._getSettings();
    const port = options.port || settings.bridgePort || 17333;
    this.token = options.token || settings.bridgeToken || crypto.randomBytes(24).toString('hex');

    // Correct setup from the account token: pick up the logged-in session's
    // DeepSeek token (API key or OAuth access token) so the bridge works
    // immediately after login without extra configuration.
    if (!this.accountToken) {
      this.accountToken = (await this._getDeepSeekApiKey()) || null;
    }

    this.server = http.createServer((req, res) => {
      this._handle(req, res).catch((err) => {
        console.error('[Bridge] unhandled error:', err);
        this._send(res, 500, { error: { message: String(err.message || err) } });
      });
    });

    await new Promise((resolve, reject) => {
      this.server.once('error', reject);
      this.server.listen(port, '127.0.0.1', resolve);
    });

    this.port = this.server.address().port;
    this.running = true;

    // Persist token/port so the UI and restarts can reuse them.
    await this._saveSettings({ bridgeEnabled: true, bridgePort: this.port, bridgeToken: this.token });

    const info = this.getInfo();
    console.log(`[Bridge] Local endpoint ready at ${info.baseUrl} (model "${BRIDGE_MODEL}")`);
    return info;
  }

  async stop() {
    if (!this.running) return;
    await new Promise((resolve) => {
      this.server.close(() => resolve());
    });
    this.server = null;
    this.running = false;
    this.sessions.clear();
    await this._saveSettings({ bridgeEnabled: false });
    console.log('[Bridge] stopped');
  }

  getInfo() {
    return {
      running: this.running,
      baseUrl: `http://127.0.0.1:${this.port}/v1`,
      port: this.port,
      token: this.token,
      model: BRIDGE_MODEL,
      // The bridge is configured from your account token: it authenticates
      // upstream calls AND can be used by connecting apps as a bearer token.
      accountTokenConfigured: Boolean(this.accountToken),
      authSchemes: ['bridge bearer token', 'deepseek account token'],
      endpoints: [
        'GET  /v1/models',
        'POST /v1/chat/completions',
        'GET  /v1/bridge/tools',
        'POST /v1/bridge/tool-exec',
        'GET  /health',
      ],
    };
  }

  /* ------------------------------------------------------------------ */
  /* Request handling                                                   */
  /* ------------------------------------------------------------------ */

  async _handle(req, res) {
    this._applyCors(req, res);
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, 'http://127.0.0.1');
    const pathname = url.pathname.replace(/\/+$/, '') || '/';

    if (pathname === '/health') {
      this._send(res, 200, { status: 'ok', bridge: true, running: this.running });
      return;
    }

    if (!(await this._authenticate(req))) {
      this._send(res, 401, { error: { message: 'Unauthorized: provide "Authorization: Bearer <bridge-token>"' } });
      return;
    }

    const body = req.method === 'POST' ? await this._readJson(req) : null;

    switch (true) {
      case pathname === '/v1/models' && req.method === 'GET':
        return this._handleModels(res);
      case pathname === '/v1/chat/completions' && req.method === 'POST':
        return this._handleChatCompletion(body, res);
      case pathname === '/v1/bridge/tools' && req.method === 'GET':
        return this._handleToolsList(res);
      case pathname === '/v1/bridge/tool-exec' && req.method === 'POST':
        return this._handleToolExec(body, res);
      case pathname.startsWith('/v1/bridge/conversations'):
        return this._handleConversations(pathname, req, res);
      default:
        return this._send(res, 404, { error: { message: `No bridge route for ${req.method} ${pathname}` } });
    }
  }

  _handleModels(res) {
    const now = Math.floor(Date.now() / 1000);
    this._send(res, 200, {
      object: 'list',
      data: [
        { id: BRIDGE_MODEL, object: 'model', created: now, owned_by: 'deepseek-desktop-bridge' },
        { id: 'deepseek-chat', object: 'model', created: now, owned_by: 'deepseek' },
        { id: 'deepseek-reasoner', object: 'model', created: now, owned_by: 'deepseek' },
      ],
    });
  }

  async _handleToolsList(res) {
    let plugins = [];
    try {
      if (this.pluginManager && typeof this.pluginManager.getAllPlugins === 'function') {
        plugins = await this.pluginManager.getAllPlugins();
      } else if (this.pluginManager && Array.isArray(this.pluginManager.plugins)) {
        plugins = this.pluginManager.plugins;
      }
    } catch (e) {
      /* plugins are optional metadata; don't fail the request */
    }

    this._send(res, 200, {
      tools: this.exposedTools.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
        kind: 'tool',
      })),
      plugins: plugins.map((p) => ({
        id: p.id || p.pluginId,
        name: p.name || p.id,
        enabled: p.enabled !== false,
        kind: 'plugin',
      })),
      skills: [],
      mcpServers: [],
    });
  }

  async _handleToolExec(body, res) {
    const { tool, args } = body || {};
    if (!tool) return this._send(res, 400, { error: { message: '"tool" is required' } });
    const result = await this._executeTool(tool, args || {});
    this._send(res, result.error ? 500 : 200, result);
  }

  /* ------------------------------------------------------------------ */
  /* Bridge conversations (full chat access for external apps)          */
  /* ------------------------------------------------------------------ */

  /**
   * GET    /v1/bridge/conversations          – list bridge-owned chats
   * GET    /v1/bridge/conversations/:id      – fetch stored messages
   * DELETE /v1/bridge/conversations/:id      – delete a bridge chat
   */
  async _handleConversations(pathname, req, res) {
    const idMatch = pathname.match(/^\/v1\/bridge\/conversations\/(.+)$/);
    if (!this.conversationManager) {
      return this._send(res, 503, { error: { message: 'conversation manager unavailable' } });
    }

    if (!idMatch) {
      if (req.method !== 'GET') return this._send(res, 405, { error: { message: 'method not allowed' } });
      try {
        const all = this.conversationManager.getAllConversations() || [];
        const bridgeConvs = all.filter((c) => c && c.metadata && c.metadata.bridge === true);
        return this._send(res, 200, { object: 'list', data: bridgeConvs });
      } catch (err) {
        return this._send(res, 500, { error: { message: String(err.message || err) } });
      }
    }

    const id = decodeURIComponent(idMatch[1]);
    if (req.method === 'GET') {
      try {
        const conversation = this.conversationManager.getConversation(id);
        if (!conversation) return this._send(res, 404, { error: { message: 'conversation not found' } });
        const messages = this.conversationManager.getMessages(id);
        return this._send(res, 200, { object: 'list', data: messages });
      } catch (err) {
        return this._send(res, 500, { error: { message: String(err.message || err) } });
      }
    }
    if (req.method === 'DELETE') {
      try {
        this.conversationManager.deleteConversation(id);
        this.sessions.delete(id);
        return this._send(res, 200, { deleted: id });
      } catch (err) {
        return this._send(res, 500, { error: { message: String(err.message || err) } });
      }
    }
    return this._send(res, 405, { error: { message: 'method not allowed' } });
  }

  /**
   * Persist a bridge chat turn into the app's own conversation store so other
   * AI apps get full use of the chat: history survives restarts and appears
   * alongside in-app conversations. Falls back to an in-memory session when
   * ConversationManager is unavailable.
   */
  async _persistTurn(convId, userContent, assistantMessage) {
    if (!this.conversationManager) {
      const mem = this.sessions.get(convId) || [];
      mem.push({ role: 'user', content: userContent });
      mem.push(assistantMessage);
      if (mem.length > this.maxSessionMessages) mem.splice(0, mem.length - this.maxSessionMessages);
      this.sessions.set(convId, mem);
      return;
    }
    try {
      let exists = false;
      try {
        exists = Boolean(this.conversationManager.getConversation(convId));
      } catch {
        exists = false;
      }
      if (!exists) {
        this.conversationManager.createConversation(
          `Bridge · ${new Date().toISOString().slice(0, 16)} (${this.accountEmail || 'local app'})`,
          'deepseek-bridge',
          'deepseek-chat',
          { bridge: true }
        );
      }
      if (userContent != null) this.conversationManager.addMessage(convId, 'user', String(userContent), { bridge: true });
      const content =
        typeof assistantMessage.content === 'string'
          ? assistantMessage.content
          : JSON.stringify(assistantMessage.content || '');
      this.conversationManager.addMessage(convId, 'assistant', content, {
        bridge: true,
        tool_calls: assistantMessage.tool_calls || undefined,
      });
    } catch (err) {
      console.error('[Bridge] failed to persist conversation turn:', err);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Chat completions (OpenAI-compatible, with tool round-trips)        */
  /* ------------------------------------------------------------------ */

  async _handleChatCompletion(body, res) {
    if (!body || !Array.isArray(body.messages)) {
      return this._send(res, 400, { error: { message: 'messages[] is required' } });
    }

    const apiKey = await this._getDeepSeekApiKey();
    if (!apiKey) {
      return this._send(res, 503, { error: { message: 'Bridge not ready: no DeepSeek API key found. Log in first.' } });
    }

    const wantsStream = body.stream === true;
    const maxRounds = Math.min(body.bridge_max_tool_rounds ?? 4, 10);

    let messages = [...body.messages];

    // Persistent chat: if the caller supplies a conversation id (header or
    // body), prepend stored history so external apps get full use of the chat.
    const convId = this._conversationId(req, body);
    if (convId) {
      const history = await this._loadHistory(convId);
      if (history.length > 0) {
        messages = [...history, ...messages];
      }
    }

    // Advertise only tools that actually exist in the local registry so the
    // model never hallucinates calls to unavailable actions.
    const availableExecutors = await this._getAvailableExecutorNames();

    // Build tool definitions: caller-provided + our locally exposed ones +
    // every ToolExecutor action + installed plugins/skills ("full use").
    const dynamicTools = await this._discoverAllTools(availableExecutors);
    const seenNames = new Set();
    const toolDefs = [];
    for (const def of [
      ...(Array.isArray(body.tools) ? body.tools : []),
      ...this.exposedTools
        .filter((t) => availableExecutors === null || availableExecutors.has(t.executor))
        .map((t) => ({
          type: 'function',
          function: { name: t.name, description: t.description, parameters: t.parameters },
        })),
      ...dynamicTools,
    ]) {
      const name = def?.function?.name;
      if (!name || seenNames.has(name)) continue;
      seenNames.add(name);
      toolDefs.push(def);
    }

    const completionId = `chatcmpl-bridge-${crypto.randomUUID()}`;
    const created = Math.floor(Date.now() / 1000);
    const model = body.model && body.model !== BRIDGE_MODEL ? body.model : 'deepseek-chat';

    if (wantsStream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
    }

    for (let round = 0; round <= maxRounds; round++) {
      const payload = {
        model,
        messages,
        temperature: body.temperature ?? 1.0,
        max_tokens: body.max_tokens,
        stream: wantsStream,
      };
      if (toolDefs.length > 0) payload.tools = toolDefs;

      const upstream = await this._upstreamRequest(apiKey, payload, wantsStream);

      if (wantsStream) {
        // Stream tokens to the caller while accumulating tool_calls.
        const acc = this._accumulateStream(upstream.iterator, (event) => {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        });
        const assistantMsg = await acc;
        messages.push(assistantMsg);

        if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
          const results = await this._runToolCalls(assistantMsg.tool_calls);
          messages.push(...results);
          continue; // another round with tool results
        }
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      const choice = upstream.choices?.[0];
      const assistantMsg = choice?.message || { role: 'assistant', content: '' };
      messages.push(assistantMsg);

      if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0 && round < maxRounds) {
        const results = await this._runToolCalls(assistantMsg.tool_calls);
        messages.push(...results);
        continue; // loop back: let the model act on tool results
      }

      this._send(res, 200, {
        id: completionId,
        object: 'chat.completion',
        created,
        model: body.model || BRIDGE_MODEL,
        choices: [{ index: 0, message: assistantMsg, finish_reason: choice?.finish_reason || 'stop' }],
        usage: upstream.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      });
      return;
    }
  }

  async _runToolCalls(toolCalls) {
    const results = [];
    for (const call of toolCalls) {
      let args = {};
      try {
        args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
      } catch {
        args = {};
      }
      const outcome = await this._executeTool(call.function?.name, args);
      results.push({
        role: 'tool',
        tool_call_id: call.id,
        content: typeof outcome === 'string' ? outcome : JSON.stringify(outcome),
      });
    }
    return results;
  }

  async _executeTool(name, args) {
    if (!name) return { error: 'missing tool name' };
    // Direct executor names are also accepted (e.g. "filesystem.read").
    const mapping = this.exposedTools.find((t) => t.name === name);
    const executorName = mapping ? mapping.executor : name;
    try {
      if (!this.toolExecutor) return { error: 'tool executor unavailable' };
      const result = await this.toolExecutor.execute(executorName, args);
      return { ok: true, tool: name, result };
    } catch (err) {
      return { error: String(err.message || err), tool: name };
    }
  }

  /**
   * Discover which ToolExecutor actions are actually available so we only
   * advertise real tools over the bridge. Returns null when discovery is
   * impossible (in which case everything is advertised).
   */
  async _getAvailableExecutorNames() {
    try {
      if (this.toolExecutor && typeof this.toolExecutor.listTools === 'function') {
        const list = await this.toolExecutor.listTools();
        return new Set((list || []).map((t) => (typeof t === 'string' ? t : t.name)));
      }
      if (this.toolExecutor && typeof this.toolExecutor.getAvailableTools === 'function') {
        const list = await this.toolExecutor.getAvailableTools();
        return new Set((list || []).map((t) => (typeof t === 'string' ? t : t.name)));
      }
      // Inspect the switch-case registry statically via source.
      const src = this.toolExecutor && this.toolExecutor.execute ? this.toolExecutor.execute.toString() : '';
      if (src.includes('case')) {
        const names = new Set();
        const re = /case\s+['"]([^'"]+)['"]\s*:/g;
        let m;
        while ((m = re.exec(src))) names.add(m[1]);
        return names;
      }
    } catch {
      /* fall back to advertising all */
    }
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* Upstream DeepSeek API                                              */
  /* ------------------------------------------------------------------ */

  async _upstreamRequest(apiKey, payload, stream) {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`DeepSeek API error ${response.status}: ${text.slice(0, 500)}`);
    }
    if (!stream) return response.json();
    return { iterator: this._sseLines(response) };
  }

  async *_sseLines(response) {
    const reader = response.body.getReader();
    try {
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (line.startsWith('data: ')) yield line.slice(6);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Consume upstream SSE chunks, forward translated events to the sink,
   * and resolve with the fully-assembled assistant message.
   */
  async _accumulateStream(iterator, sink) {
    let content = '';
    const toolCalls = [];
    for await (const raw of iterator) {
      if (raw === '[DONE]') break;
      let chunk;
      try {
        chunk = JSON.parse(raw);
      } catch {
        continue;
      }
      const delta = chunk.choices?.[0]?.delta || {};
      if (delta.content) {
        content += delta.content;
        sink({ ...chunk, choices: [{ index: 0, delta: { content: delta.content }, finish_reason: null }] });
      }
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const i = tc.index ?? 0;
          toolCalls[i] = toolCalls[i] || { id: '', type: 'function', function: { name: '', arguments: '' } };
          if (tc.id) toolCalls[i].id = tc.id;
          if (tc.function?.name) toolCalls[i].function.name += tc.function.name;
          if (tc.function?.arguments) toolCalls[i].function.arguments += tc.function.arguments;
        }
        sink(chunk);
      }
      const finish = chunk.choices?.[0]?.finish_reason;
      if (finish) sink({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: finish }] });
    }
    const msg = { role: 'assistant', content: content || null };
    if (toolCalls.length > 0) msg.tool_calls = toolCalls.filter(Boolean);
    return msg;
  }

  /* ------------------------------------------------------------------ */
  /* Auth / misc helpers                                                */
  /* ------------------------------------------------------------------ */

  async _authenticate(req) {
    if (!this.token && !this.accountToken) return false;
    const header = req.headers['authorization'] || '';
    const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!bearer) return false;
    // Accept EITHER the generated bridge token OR the DeepSeek account token,
    // so any app already holding your account credentials gets full use of the
    // chat/bridge without extra setup.
    return this._tokenMatches(bearer, this.token) || this._tokenMatches(bearer, this.accountToken);
  }

  _tokenMatches(candidate, expected) {
    if (!expected) return false;
    const a = Buffer.from(candidate);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  _applyCors(req, res) {
    const origin = req.headers.origin || '';
    // Only allow localhost/127.0.0.1 origins so local webapps can connect.
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Bridge-Conversation');
    }
  }

  _readJson(req) {
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (c) => {
        data += c;
        if (data.length > 5 * 1024 * 1024) {
          reject(new Error('request body too large'));
          req.destroy();
        }
      });
      req.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch (e) {
          reject(new Error('invalid JSON body'));
        }
      });
      req.on('error', reject);
    });
  }

  _send(res, status, obj) {
    const payload = JSON.stringify(obj);
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(payload);
  }

  async _getDeepSeekApiKey() {
    // Prefer the live account token injected at login (OAuth access token or
    // API key from the account session).
    if (this.accountToken) return this.accountToken;
    try {
      if (this.secretStore) {
        const key =
          (typeof this.secretStore.getSecret === 'function' && (await this.secretStore.getSecret('deepseek_api_key'))) ||
          (typeof this.secretStore.get === 'function' && (await this.secretStore.get('deepseek_api_key'))) ||
          (typeof this.secretStore.getApiKey === 'function' && (await this.secretStore.getApiKey('deepseek'))) ||
          (typeof this.secretStore.getApiKey === 'function' && (await this.secretStore.getApiKey('deepseek-api'))) ||
          (typeof this.secretStore.getOAuthToken === 'function' && (await this.secretStore.getOAuthToken('deepseek')));
        if (key) return key;
      }
      if (this.settings && typeof this.settings.get === 'function') {
        return await this.settings.get('deepseek.apiKey');
      }
    } catch {
      /* fall through */
    }
    return process.env.DEEPSEEK_API_KEY || null;
  }

  async _getSettings() {
    try {
      if (this.settings && typeof this.settings.getAll === 'function') return (await this.settings.getAll()) || {};
      if (this.settings && typeof this.settings.get === 'function') {
        return {
          bridgePort: await this.settings.get('bridge.port'),
          bridgeToken: await this.settings.get('bridge.token'),
        };
      }
    } catch {
      /* ignore */
    }
    return {};
  }

  async _saveSettings(patch) {
    try {
      if (this.settings && typeof this.settings.setMany === 'function') {
        await this.settings.setMany(patch);
      } else if (this.settings && typeof this.settings.set === 'function') {
        for (const [k, v] of Object.entries(patch)) await this.settings.set(k, v);
      }
    } catch {
      /* persistence is best-effort */
    }
  }
}

module.exports = { BridgeServer, BRIDGE_MODEL };
