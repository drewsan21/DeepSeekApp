/**
 * Build Configuration Test
 * Verifies that electron-builder configuration is valid
 */

const fs = require('fs');
const path = require('path');

describe('Build Configuration', () => {
  let packageJson;

  beforeAll(() => {
    const packagePath = path.join(__dirname, '..', 'package.json');
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  });

  describe('Package.json', () => {
    test('should have electron-builder dependency', () => {
      expect(packageJson.dependencies['electron-builder']).toBeDefined();
    });

    test('should have electron dependency', () => {
      expect(packageJson.dependencies['electron']).toBeDefined();
    });

    test('should have main entry point', () => {
      expect(packageJson.main).toBe('electron/main.js');
    });

    test('should have build scripts', () => {
      expect(packageJson.scripts['electron:build']).toBeDefined();
      expect(packageJson.scripts['build:win']).toBeDefined();
      expect(packageJson.scripts['build:linux']).toBeDefined();
      expect(packageJson.scripts['build:mac']).toBeDefined();
      expect(packageJson.scripts['build:all']).toBeDefined();
    });
  });

  describe('Build Configuration', () => {
    test('should have build configuration', () => {
      expect(packageJson.build).toBeDefined();
    });

    test('should have appId', () => {
      expect(packageJson.build.appId).toBe('com.deepseek.desktop');
    });

    test('should have productName', () => {
      expect(packageJson.build.productName).toBe('DeepSeek Desktop');
    });

    test('should have output directory', () => {
      expect(packageJson.build.directories.output).toBe('release');
    });

    test('should have files configuration', () => {
      expect(packageJson.build.files).toBeDefined();
      expect(Array.isArray(packageJson.build.files)).toBe(true);
    });
  });

  describe('Windows Configuration', () => {
    test('should have Windows configuration', () => {
      expect(packageJson.build.win).toBeDefined();
    });

    test('should target NSIS and portable', () => {
      const targets = packageJson.build.win.target;
      expect(targets).toBeDefined();
      
      const targetNames = targets.map(t => typeof t === 'string' ? t : t.target);
      expect(targetNames).toContain('nsis');
      expect(targetNames).toContain('portable');
    });

    test('should have NSIS configuration', () => {
      expect(packageJson.build.nsis).toBeDefined();
      expect(packageJson.build.nsis.oneClick).toBe(false);
      expect(packageJson.build.nsis.allowToChangeInstallationDirectory).toBe(true);
    });
  });

  describe('macOS Configuration', () => {
    test('should have macOS configuration', () => {
      expect(packageJson.build.mac).toBeDefined();
    });

    test('should target DMG', () => {
      const targets = packageJson.build.mac.target;
      expect(targets).toBeDefined();
      
      const targetNames = targets.map(t => typeof t === 'string' ? t : t.target);
      expect(targetNames).toContain('dmg');
    });

    test('should have entitlements', () => {
      expect(packageJson.build.mac.entitlements).toBeDefined();
    });

    test('should have hardened runtime', () => {
      expect(packageJson.build.mac.hardenedRuntime).toBe(true);
    });
  });

  describe('Linux Configuration', () => {
    test('should have Linux configuration', () => {
      expect(packageJson.build.linux).toBeDefined();
    });

    test('should target deb and AppImage', () => {
      const targets = packageJson.build.linux.target;
      expect(targets).toBeDefined();
      
      const targetNames = targets.map(t => typeof t === 'string' ? t : t.target);
      expect(targetNames).toContain('deb');
      expect(targetNames).toContain('AppImage');
    });

    test('should have category', () => {
      expect(packageJson.build.linux.category).toBe('Development');
    });

    test('should have dependencies', () => {
      expect(packageJson.build.deb).toBeDefined();
      expect(packageJson.build.deb.depends).toBeDefined();
      expect(Array.isArray(packageJson.build.deb.depends)).toBe(true);
    });
  });

  describe('Build Scripts', () => {
    const scripts = [
      'scripts/build-windows.sh',
      'scripts/build-linux.sh',
      'scripts/build-macos.sh',
      'scripts/convert-icons.sh',
      'scripts/verify-builds.sh'
    ];

    scripts.forEach(script => {
      test(`${script} should exist`, () => {
        const scriptPath = path.join(__dirname, '..', script);
        expect(fs.existsSync(scriptPath)).toBe(true);
      });
    });
  });

  describe('Build Assets', () => {
    test('build directory should exist', () => {
      const buildDir = path.join(__dirname, '..', 'build');
      expect(fs.existsSync(buildDir)).toBe(true);
    });

    test('entitlements file should exist', () => {
      const entitlementsPath = path.join(__dirname, '..', 'build', 'entitlements.mac.plist');
      expect(fs.existsSync(entitlementsPath)).toBe(true);
    });

    test('icon source should exist', () => {
      const iconPath = path.join(__dirname, '..', 'public', 'icon.svg');
      expect(fs.existsSync(iconPath)).toBe(true);
    });
  });

  describe('Documentation', () => {
    test('BUILD_GUIDE.md should exist', () => {
      const guidePath = path.join(__dirname, '..', 'BUILD_GUIDE.md');
      expect(fs.existsSync(guidePath)).toBe(true);
    });

    test('CROSS_PLATFORM_BUILD_STATUS.md should exist', () => {
      const statusPath = path.join(__dirname, '..', 'CROSS_PLATFORM_BUILD_STATUS.md');
      expect(fs.existsSync(statusPath)).toBe(true);
    });
  });
});
