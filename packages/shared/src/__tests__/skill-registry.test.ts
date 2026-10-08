// ============================================================================
// Skill Registry Tests
// ============================================================================

import {
  getDefaultSkills,
  getAvailableSkills,
  getAllSkills,
  getSkillById,
  getSkillsByCategory,
  getInstalledSkills,
  getEnabledSkills,
  getSkillDependencies,
  getSkillTools,
  canInstallSkill,
  DEFAULT_SKILLS,
  AVAILABLE_SKILLS,
} from '../src/skill-registry';

describe('Skill Registry', () => {
  describe('getDefaultSkills', () => {
    it('should return default skills', () => {
      const skills = getDefaultSkills();
      expect(skills.length).toBe(DEFAULT_SKILLS.length);
      skills.forEach((skill) => {
        expect(skill.isInstalled).toBe(true);
      });
    });
  });

  describe('getAvailableSkills', () => {
    it('should return available skills', () => {
      const skills = getAvailableSkills();
      expect(skills.length).toBe(AVAILABLE_SKILLS.length);
      skills.forEach((skill) => {
        expect(skill.isInstalled).toBe(false);
      });
    });
  });

  describe('getAllSkills', () => {
    it('should return all skills', () => {
      const skills = getAllSkills();
      expect(skills.length).toBe(DEFAULT_SKILLS.length + AVAILABLE_SKILLS.length);
    });
  });

  describe('getSkillById', () => {
    it('should return skill by id', () => {
      const skill = getSkillById('computer-use-basic');
      expect(skill).toBeDefined();
      expect(skill?.id).toBe('computer-use-basic');
    });

    it('should return undefined for non-existent skill', () => {
      const skill = getSkillById('non-existent');
      expect(skill).toBeUndefined();
    });
  });

  describe('getSkillsByCategory', () => {
    it('should filter skills by category', () => {
      const skills = getSkillsByCategory('computer-use');
      expect(skills.length).toBeGreaterThan(0);
      skills.forEach((skill) => {
        expect(skill.category).toBe('computer-use');
      });
    });

    it('should return empty array for non-existent category', () => {
      const skills = getSkillsByCategory('non-existent' as any);
      expect(skills).toEqual([]);
    });
  });

  describe('getInstalledSkills', () => {
    it('should return only installed skills', () => {
      const skills = getInstalledSkills();
      expect(skills.length).toBeGreaterThan(0);
      skills.forEach((skill) => {
        expect(skill.isInstalled).toBe(true);
      });
    });
  });

  describe('getEnabledSkills', () => {
    it('should return only enabled skills', () => {
      const skills = getEnabledSkills();
      expect(skills.length).toBeGreaterThan(0);
      skills.forEach((skill) => {
        expect(skill.isEnabled).toBe(true);
      });
    });
  });

  describe('getSkillDependencies', () => {
    it('should return dependencies for a skill', () => {
      const deps = getSkillDependencies('computer-use-advanced');
      expect(deps).toContain('computer-use-basic');
    });

    it('should return empty array for skill with no dependencies', () => {
      const deps = getSkillDependencies('computer-use-basic');
      expect(deps).toEqual([]);
    });
  });

  describe('getSkillTools', () => {
    it('should return tools for a skill', () => {
      const tools = getSkillTools('computer-use-basic');
      expect(tools.length).toBeGreaterThan(0);
      expect(tools).toContain('click');
    });
  });

  describe('canInstallSkill', () => {
    it('should return true if skill can be installed', () => {
      const canInstall = canInstallSkill('computer-use-ocr', ['computer-use-basic']);
      expect(canInstall).toBe(true);
    });

    it('should return false if dependencies are missing', () => {
      const canInstall = canInstallSkill('computer-use-ocr', []);
      expect(canInstall).toBe(false);
    });

    it('should return false if skill is already installed', () => {
      const canInstall = canInstallSkill('computer-use-basic', []);
      expect(canInstall).toBe(false);
    });
  });
});
