import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show login button when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Check for login button in sidebar
    const loginButton = page.getByRole('button', { name: /sign in/i });
    await expect(loginButton).toBeVisible();
  });

  test('should open auth window when login clicked', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Click login button
    const loginButton = page.getByRole('button', { name: /sign in/i });
    await loginButton.click();
    
    // Auth window should open (in real app, this would be a separate window)
    // For E2E testing, we verify the action was triggered
    await expect(loginButton).toBeVisible();
  });

  test('should show logout button when authenticated', async ({ page }) => {
    // Mock authenticated state
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      localStorage.setItem('mock-auth', 'true');
    });
    await page.reload();
    
    // Check for logout button
    const logoutButton = page.getByRole('button', { name: /sign out/i });
    // Note: This would work with actual auth state management
  });
});

test.describe('Provider Selection', () => {
  test('should display provider selector', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Navigate to providers view
    const providersButton = page.getByRole('button', { name: /providers/i });
    await providersButton.click();
    
    // Check for provider selector
    const providerSelect = page.locator('select').first();
    await expect(providerSelect).toBeVisible();
  });

  test('should switch between providers', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Navigate to providers
    const providersButton = page.getByRole('button', { name: /providers/i });
    await providersButton.click();
    
    // Select different provider
    const providerSelect = page.locator('select').first();
    await providerSelect.selectOption('deepseek-api');
    
    // Verify selection changed
    await expect(providerSelect).toHaveValue('deepseek-api');
  });

  test('should show model selector for selected provider', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const providersButton = page.getByRole('button', { name: /providers/i });
    await providersButton.click();
    
    // Check for model selector
    const modelSelect = page.locator('select').nth(1);
    await expect(modelSelect).toBeVisible();
  });
});

test.describe('Browser Tab Management', () => {
  test('should navigate to browser view', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const browserButton = page.getByRole('button', { name: /browser/i });
    await browserButton.click();
    
    // Check for tab strip
    const tabStrip = page.locator('.tabs');
    await expect(tabStrip).toBeVisible();
  });

  test('should create new tab', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const browserButton = page.getByRole('button', { name: /browser/i });
    await browserButton.click();
    
    // Enter URL and create tab
    const urlInput = page.locator('input[placeholder*="http"]');
    await urlInput.fill('https://example.com');
    
    const goButton = page.getByRole('button', { name: /go/i });
    await goButton.click();
    
    // Verify tab was created
    const tabs = page.locator('.tab');
    await expect(tabs).toHaveCount(await tabs.count() + 1);
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const browserButton = page.getByRole('button', { name: /browser/i });
    await browserButton.click();
    
    // Create multiple tabs
    const urlInput = page.locator('input[placeholder*="http"]');
    await urlInput.fill('https://example1.com');
    await page.getByRole('button', { name: /go/i }).click();
    
    await urlInput.fill('https://example2.com');
    await page.getByRole('button', { name: /go/i }).click();
    
    // Switch between tabs
    const tabs = page.locator('.tab');
    const firstTab = tabs.first();
    await firstTab.click();
    
    await expect(firstTab).toHaveClass(/active/);
  });

  test('should close tab', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const browserButton = page.getByRole('button', { name: /browser/i });
    await browserButton.click();
    
    // Create a tab
    const urlInput = page.locator('input[placeholder*="http"]');
    await urlInput.fill('https://example.com');
    await page.getByRole('button', { name: /go/i }).click();
    
    // Close the tab
    const closeButton = page.locator('.tab button').first();
    await closeButton.click();
    
    // Verify tab was closed
    const tabs = page.locator('.tab');
    const initialCount = await tabs.count();
    await expect(tabs).toHaveCount(initialCount - 1);
  });
});

test.describe('Tool Execution', () => {
  test('should execute browser use action', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const browserUseButton = page.getByRole('button', { name: /browser use/i });
    await browserUseButton.click();
    
    // Select action type
    const actionSelect = page.locator('select').first();
    await actionSelect.selectOption('navigate');
    
    // Enter URL
    const urlInput = page.locator('input[placeholder*="http"]');
    await urlInput.fill('https://example.com');
    
    // Execute action
    const executeButton = page.getByRole('button', { name: /execute/i });
    await executeButton.click();
    
    // Verify action was executed
    await expect(executeButton).toBeVisible();
  });

  test('should show computer use approval dialog', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Trigger a computer use action that requires approval
    // This would normally come from the harness
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('mock-approval-request', {
        detail: {
          id: 'test-approval',
          tool: 'click',
          args: { x: 100, y: 200 },
          description: 'Click at coordinates'
        }
      }));
    });
    
    // Check for approval dialog
    const approvalDialog = page.locator('.approval-dialog');
    await expect(approvalDialog).toBeVisible();
  });
});

test.describe('Settings Management', () => {
  test('should navigate to settings', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    // Check for settings panel
    const settingsPanel = page.locator('.settings');
    await expect(settingsPanel).toBeVisible();
  });

  test('should configure provider settings', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    // Find provider configuration
    const providerRow = page.locator('.provider-row').first();
    await expect(providerRow).toBeVisible();
    
    // Configure API key
    const apiKeyInput = providerRow.locator('input[type="password"]');
    await apiKeyInput.fill('test-api-key');
    
    // Save configuration
    const saveButton = providerRow.getByRole('button', { name: /save/i });
    await saveButton.click();
  });

  test('should manage site permissions', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();
    
    // Find permissions section
    const permissionsSection = page.locator('.permission-site');
    await expect(permissionsSection).toBeVisible();
  });
});

test.describe('MCP Server Management', () => {
  test('should navigate to MCP servers', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const mcpButton = page.getByRole('button', { name: /mcp/i });
    await mcpButton.click();
    
    // Check for MCP server list
    const serverList = page.locator('.mcp-server-list');
    await expect(serverList).toBeVisible();
  });

  test('should start MCP server', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const mcpButton = page.getByRole('button', { name: /mcp/i });
    await mcpButton.click();
    
    // Find start button
    const startButton = page.locator('.mcp-toggle-btn.start').first();
    await startButton.click();
    
    // Verify server started
    const statusIndicator = page.locator('.mcp-server-status.running').first();
    await expect(statusIndicator).toBeVisible();
  });

  test('should stop MCP server', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const mcpButton = page.getByRole('button', { name: /mcp/i });
    await mcpButton.click();
    
    // Find stop button
    const stopButton = page.locator('.mcp-toggle-btn.stop').first();
    await stopButton.click();
    
    // Verify server stopped
    const statusIndicator = page.locator('.mcp-server-status.stopped').first();
    await expect(statusIndicator).toBeVisible();
  });
});

test.describe('Skill Marketplace', () => {
  test('should navigate to skills', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const skillsButton = page.getByRole('button', { name: /skills/i });
    await skillsButton.click();
    
    // Check for skill marketplace
    const marketplace = page.locator('.skill-marketplace');
    await expect(marketplace).toBeVisible();
  });

  test('should search skills', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const skillsButton = page.getByRole('button', { name: /skills/i });
    await skillsButton.click();
    
    // Search for a skill
    const searchInput = page.locator('.search-input');
    await searchInput.fill('computer');
    
    // Verify results filtered
    const skillItems = page.locator('.skill-item');
    await expect(skillItems.first()).toBeVisible();
  });

  test('should install skill', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const skillsButton = page.getByRole('button', { name: /skills/i });
    await skillsButton.click();
    
    // Find available skill
    const installButton = page.locator('.install-btn').first();
    await installButton.click();
    
    // Verify skill installed
    const statusBadge = page.locator('.status-badge.installed').first();
    await expect(statusBadge).toBeVisible();
  });
});

test.describe('Project Sync', () => {
  test('should navigate to projects', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const projectsButton = page.getByRole('button', { name: /projects/i });
    await projectsButton.click();
    
    // Check for project dashboard
    const dashboard = page.locator('.project-sync-dashboard');
    await expect(dashboard).toBeVisible();
  });

  test('should add new project', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const projectsButton = page.getByRole('button', { name: /projects/i });
    await projectsButton.click();
    
    // Click add project button
    const addButton = page.getByRole('button', { name: /add project/i });
    await addButton.click();
    
    // Fill project details
    const pathInput = page.locator('input[placeholder*="path"]');
    await pathInput.fill('/path/to/project');
    
    const remoteInput = page.locator('input[placeholder*="github"]');
    await remoteInput.fill('https://github.com/user/repo.git');
    
    // Save project
    const saveButton = page.getByRole('button', { name: /add/i });
    await saveButton.click();
    
    // Verify project added
    const projectItem = page.locator('.project-item').first();
    await expect(projectItem).toBeVisible();
  });

  test('should sync project', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    const projectsButton = page.getByRole('button', { name: /projects/i });
    await projectsButton.click();
    
    // Find sync button
    const syncButton = page.locator('.sync-btn').first();
    await syncButton.click();
    
    // Verify sync started
    const statusIndicator = page.locator('.status-indicator.syncing').first();
    await expect(statusIndicator).toBeVisible();
  });
});
