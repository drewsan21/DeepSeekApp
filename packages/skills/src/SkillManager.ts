// ============================================================================
// Skill Manager - Manages skill installation, configuration, and lifecycle
// ============================================================================

import { EventEmitter } from 'events';
import type { Skill, SkillInstallationResult, SkillCategory } from '@deepseek/shared';
import { DEFAULT_SKILLS, AVAILABLE_SKILLS, getSkillById } from '@deepseek/shared';

export class SkillManager extends EventEmitter {
  private installedSkills: Map<string, Skill> = new Map();
  private skillConfigs: Map<string, Record<string, unknown>> = new Map();

  constructor() {
    super();
    this.initializeDefaultSkills();
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  private initializeDefaultSkills(): void {
    for (const skill of DEFAULT_SKILLS) {
      this.installedSkills.set(skill.id, { ...skill });
      this.skillConfigs.set(skill.id, { ...skill.config });
    }
  }

  // ============================================================================
  // Skill Installation
  // ============================================================================

  async install(skillId: string): Promise<SkillInstallationResult> {
    // Check if already installed
    if (this.installedSkills.has(skillId)) {
      return {
        success: false,
        error: 'Skill already installed',
      };
    }

    // Find skill in available skills
    const availableSkill = AVAILABLE_SKILLS.find((s) => s.id === skillId);
    if (!availableSkill) {
      return {
        success: false,
        error: `Skill not found: ${skillId}`,
      };
    }

    // Check dependencies
    const missingDeps = availableSkill.dependencies.filter(
      (dep) => !this.installedSkills.has(dep)
    );

    if (missingDeps.length > 0) {
      return {
        success: false,
        error: `Missing dependencies: ${missingDeps.join(', ')}`,
      };
    }

    // Install skill
    const skill: Skill = {
      ...availableSkill,
      isInstalled: true,
      isEnabled: true,
    };

    this.installedSkills.set(skillId, skill);
    this.skillConfigs.set(skillId, { ...skill.config });

    this.emit('skill-installed', skill);

    return {
      success: true,
      skill,
      installedDependencies: [],
    };
  }

  async uninstall(skillId: string): Promise<void> {
    const skill = this.installedSkills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not installed: ${skillId}`);
    }

    // Check if other skills depend on this one
    const dependents = Array.from(this.installedSkills.values()).filter((s) =>
      s.dependencies.includes(skillId)
    );

    if (dependents.length > 0) {
      throw new Error(
        `Cannot uninstall: ${dependents.map((d) => d.name).join(', ')} depend on this skill`
      );
    }

    this.installedSkills.delete(skillId);
    this.skillConfigs.delete(skillId);

    this.emit('skill-uninstalled', skillId);
  }

  // ============================================================================
  // Skill Management
  // ============================================================================

  async enable(skillId: string): Promise<void> {
    const skill = this.installedSkills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not installed: ${skillId}`);
    }

    skill.isEnabled = true;
    this.emit('skill-enabled', skillId);
  }

  async disable(skillId: string): Promise<void> {
    const skill = this.installedSkills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not installed: ${skillId}`);
    }

    skill.isEnabled = false;
    this.emit('skill-disabled', skillId);
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  async getConfig(skillId: string): Promise<Record<string, unknown>> {
    const config = this.skillConfigs.get(skillId);
    if (!config) {
      throw new Error(`Skill not installed: ${skillId}`);
    }

    return { ...config };
  }

  async setConfig(skillId: string, config: Record<string, unknown>): Promise<void> {
    const skill = this.installedSkills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not installed: ${skillId}`);
    }

    this.skillConfigs.set(skillId, { ...config });
    skill.config = { ...config };

    this.emit('skill-config-updated', skillId, config);
  }

  // ============================================================================
  // Queries
  // ============================================================================

  list(): Skill[] {
    return Array.from(this.installedSkills.values());
  }

  listAvailable(): Skill[] {
    return AVAILABLE_SKILLS.filter((s) => !this.installedSkills.has(s.id));
  }

  listAll(): Skill[] {
    const installed = Array.from(this.installedSkills.values());
    const available = AVAILABLE_SKILLS.filter((s) => !this.installedSkills.has(s.id));
    return [...installed, ...available];
  }

  get(skillId: string): Skill | undefined {
    return this.installedSkills.get(skillId);
  }

  getByCategory(category: SkillCategory): Skill[] {
    return Array.from(this.installedSkills.values()).filter(
      (s) => s.category === category
    );
  }

  getEnabled(): Skill[] {
    return Array.from(this.installedSkills.values()).filter((s) => s.isEnabled);
  }

  getTools(): string[] {
    const tools: string[] = [];
    for (const skill of this.installedSkills.values()) {
      if (skill.isEnabled) {
        tools.push(...skill.tools);
      }
    }
    return tools;
  }

  // ============================================================================
  // Dependency Management
  // ============================================================================

  async installWithDependencies(skillId: string): Promise<SkillInstallationResult> {
    const skill = getSkillById(skillId);
    if (!skill) {
      return {
        success: false,
        error: `Skill not found: ${skillId}`,
      };
    }

    const installedDeps: string[] = [];

    // Install dependencies first
    for (const depId of skill.dependencies) {
      if (!this.installedSkills.has(depId)) {
        const result = await this.install(depId);
        if (!result.success) {
          return {
            success: false,
            error: `Failed to install dependency: ${depId}`,
          };
        }
        installedDeps.push(depId);
      }
    }

    // Install the skill itself
    return await this.install(skillId);
  }

  getDependencies(skillId: string): string[] {
    const skill = this.installedSkills.get(skillId);
    return skill?.dependencies || [];
  }

  getDependents(skillId: string): string[] {
    return Array.from(this.installedSkills.values())
      .filter((s) => s.dependencies.includes(skillId))
      .map((s) => s.id);
  }

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  async installAll(): Promise<void> {
    for (const skill of AVAILABLE_SKILLS) {
      if (!this.installedSkills.has(skill.id)) {
        await this.install(skill.id);
      }
    }
  }

  async uninstallAll(): Promise<void> {
    const skillIds = Array.from(this.installedSkills.keys());
    for (const skillId of skillIds) {
      await this.uninstall(skillId);
    }
  }

  enableAll(): void {
    for (const skill of this.installedSkills.values()) {
      skill.isEnabled = true;
    }
  }

  disableAll(): void {
    for (const skill of this.installedSkills.values()) {
      skill.isEnabled = false;
    }
  }
}
