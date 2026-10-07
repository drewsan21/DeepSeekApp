import fs from 'fs/promises';
import path from 'path';
import type {
  ProviderConfigureRequest,
  ProviderPublicConfig
} from '@deepseek/shared';

interface SecretStore {
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

interface ProviderRecord {
  baseUrl?: string;
  apiKeyRef?: string;
}

const PROVIDERS = [
  { id: 'deepseek-account', label: 'DeepSeek Account', needsApiKey: false },
  { id: 'deepseek-api', label: 'DeepSeek API', needsApiKey: true },
  { id: 'custom-openai', label: 'Custom OpenAI-compatible', needsApiKey: true },
  { id: 'local-model', label: 'Local Model', needsApiKey: false }
];

export class ProviderConfigManager {
  private file: string;
  private data: Record<string, ProviderRecord> = {};

  constructor(
    userDataPath: string,
    private secrets: SecretStore
  ) {
    this.file = path.join(userDataPath, 'providers.json');
  }

  async init() {
    try {
      this.data = JSON.parse(await fs.readFile(this.file, 'utf8'));
    } catch {
      this.data = {};
    }
  }

  list(accountAuthenticated: boolean): ProviderPublicConfig[] {
    return PROVIDERS.map(p => {
      const record = this.data[p.id] ?? {};

      const connected =
        p.id === 'deepseek-account'
          ? accountAuthenticated
          : p.id === 'local-model'
            ? false
            : Boolean(record.apiKeyRef || record.baseUrl);

      return {
        id: p.id,
        label: p.label,
        connected,
        baseUrl: record.baseUrl,
        hasApiKey: Boolean(record.apiKeyRef),
        needsApiKey: p.needsApiKey
      };
    });
  }

  async configure(req: ProviderConfigureRequest) {
    if (req.id === 'deepseek-account') return;

    const record: ProviderRecord = this.data[req.id] ?? {};
    const secretKey = `deepseek/provider/${req.id}/credential`;

    if (req.baseUrl !== undefined) record.baseUrl = req.baseUrl;

    if (req.apiKey) {
      await this.secrets.set(secretKey, req.apiKey);
      record.apiKeyRef = secretKey;
    } else if (req.apiKey === '') {
      await this.secrets.delete(secretKey);
      delete record.apiKeyRef;
    }

    this.data[req.id] = record;
    await this.save();
  }

  private async save() {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(this.data, null, 2), 'utf8');
  }
}
