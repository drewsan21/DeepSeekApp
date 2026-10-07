import fs from 'fs/promises';
import path from 'path';
import type { Permission, SitePermission } from '@deepseek/shared';

const DEFAULT_PERMISSIONS: Permission[] = ['read_page', 'read_selection'];

export class PermissionManager {
  private file: string;
  private data: Record<string, Permission[]> = {};

  constructor(userDataPath: string) {
    this.file = path.join(userDataPath, 'permissions.json');
  }

  async init() {
    try {
      this.data = JSON.parse(await fs.readFile(this.file, 'utf8'));
    } catch {
      this.data = {};
    }
  }

  list(): SitePermission[] {
    return Object.entries(this.data).map(([origin, permissions]) => ({
      origin,
      permissions,
      updatedAt: Date.now()
    }));
  }

  get(origin: string): Permission[] {
    return this.data[origin] ?? DEFAULT_PERMISSIONS;
  }

  async set(origin: string, permissions: Permission[]) {
    this.data[origin] = permissions;
    await this.save();
  }

  async reset(origin: string) {
    delete this.data[origin];
    await this.save();
  }

  has(origin: string, permission: Permission) {
    return this.get(origin).includes(permission);
  }

  private async save() {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(this.data, null, 2), 'utf8');
  }
}
