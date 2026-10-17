# Local Bridge Endpoint

After you log in with your DeepSeek account, DeepSeek Desktop automatically
exposes a **custom local endpoint** (the "bridge") on `127.0.0.1` so that other
applications on the same machine can use the chat to **perform actions** —
applying tools, skills, plugins and MCP servers through the app's existing
executors.

## How it works

```
┌─────────────────┐   login    ┌──────────────────────────┐   proxy    ┌───────────────┐
│ DeepSeek Desktop│ ─────────► │ BridgeServer (localhost) │ ─────────► │ api.deepseek.com│
│  (Electron app) │            │  http://127.0.0.1:17333/v1           │               │
└─────────────────┘            └────────────▲─────────────┘            └───────────────┘
                                            │ OpenAI-compatible API + tool round-trips
                              ┌─────────────┴─────────────┐
                              │ Other local apps / agents │
                              │ (curl, SDKs, MCP clients) │
                              └───────────────────────────┘
```

- **Auto-start on login**: `auth:login` starts the bridge; `auth:logout` stops it. The bridge never runs while logged out.
- **Localhost only**: bound to `127.0.0.1`, never reachable from the network.
- **Token auth**: a random bearer token is generated at start and persisted in settings (`bridgeToken`). Every request must send `Authorization: Bearer <token>`.
- **Tool loop**: locally registered ToolExecutor actions are advertised as OpenAI function tools. When the model calls one, the bridge executes it via `ToolExecutor` and feeds the result back for another round (up to `bridge_max_tool_rounds`, default 4).

## Endpoints

| Method | Path                    | Description                                             |
| ------ | ----------------------- | ------------------------------------------------------- |
| GET    | `/health`               | Bridge status (no auth)                                 |
| GET    | `/v1/models`            | Available models incl. `deepseek-bridge`                |
| POST   | `/v1/chat/completions`  | OpenAI-compatible chat (streaming + tool round-trips)   |
| GET    | `/v1/bridge/tools`      | Exposed tools, plugins, skills, MCP servers             |
| POST   | `/v1/bridge/tool-exec`  | Direct authenticated tool execution                     |

## Quick start

Get the endpoint info from the renderer (`window.deepseek.bridge.info()`) or the
Settings → Bridge panel, then:

```bash
TOKEN=$(...your bridge token...)

# Chat — the model can apply local tools automatically
curl -s http://127.0.0.1:17333/v1/chat/completions \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"model":"deepseek-bridge","messages":[{"role":"user","content":"Read /tmp/a.txt and summarize it"}]}'

# Execute a tool directly
curl -s http://127.0.0.1:17333/v1/bridge/tool-exec \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"tool":"filesystem_list","args":{"path":"/tmp"}}'
```

Any OpenAI-compatible client works by pointing its `base_url` at
`http://127.0.0.1:17333/v1`:

```python
from openai import OpenAI
client = OpenAI(base_url="http://127.0.0.1:17333/v1", api_key=TOKEN)
resp = client.chat.completions.create(
    model="deepseek-bridge",
    messages=[{"role": "user", "content": "Commit my staged changes with message 'chore: update'"}],
)
```

## Renderer API (preload)

```ts
window.deepseek.bridge.info();                 // { running, baseUrl, port, token, model }
window.deepseek.bridge.start({ port });        // requires authenticated session
window.deepseek.bridge.stop();
window.deepseek.bridge.onStatus((info) => {}); // live updates when bridge starts/stops
```

## Security notes

- Requests without a valid bearer token get `401`; token comparison is timing-safe.
- CORS responses are only emitted for `http://localhost:*` / `http://127.0.0.1:*` origins.
- Only tools that actually exist in the local registry are advertised to the model.
- The bridge shares your DeepSeek credentials — treat the token like a password. Anyone with local access to your user account and the token can act through the exposed tools.
