import * as keytar from 'keytar';

export interface SecretStore {
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

export class LinuxSecretStore implements SecretStore {
  private service = 'DeepSeek Desktop';

  async set(key: string, value: string): Promise<void> {
    await keytar.setPassword(this.service, key, value);
  }

  async get(key: string): Promise<string | null> {
    return keytar.getPassword(this.service, key);
  }

  async delete(key: string): Promise<void> {
    await keytar.deletePassword(this.service, key);
  }
}
