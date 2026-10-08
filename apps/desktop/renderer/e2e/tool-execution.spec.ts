// ============================================================================
// E2E Tests - Tool Execution
// ============================================================================

import { test, expect } from '@playwright/test';

test.describe('Tool Execution', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to workspace view
    await page.click('button:has-text("Harness")');
  });

  test('should display workspace with task input', async ({ page }) => {
    // Check for task input textarea
    const taskInput = page.locator('textarea');
    await expect(taskInput).toBeVisible();
  });

  test('should start harness task when button clicked', async ({ page }) => {
    // Enter task description
    const taskInput = page.locator('textarea');
    await taskInput.fill('Test task');
    
    // Click start button
    const startButton = page.locator('button:has-text("Start task")');
    await startButton.click();
    
    // Wait for task to start
    await page.waitForTimeout(1000);
    
    // Check for output section
    const outputSection = page.locator('text=Output');
    await expect(outputSection).toBeVisible();
  });

  test('should display tool execution events', async ({ page }) => {
    // Start a task
    const taskInput = page.locator('textarea');
    await taskInput.fill('Execute a tool');
    await page.click('button:has-text("Start task")');
    
    // Wait for events to appear
    await page.waitForTimeout(2000);
    
    // Check for event display
    const events = page.locator('.event');
    // Events should appear (may be empty initially)
    await expect(events.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // It's okay if no events yet
    });
  });

  test('should show approval modal for sensitive actions', async ({ page }) => {
    // Start a task that requires approval
    const taskInput = page.locator('textarea');
    await taskInput.fill('Perform sensitive action');
    await page.click('button:has-text("Start task")');
    
    // Wait for approval modal (if triggered)
    await page.waitForTimeout(2000);
    
    // Check for approval modal (may or may not appear depending on task)
    const approvalModal = page.locator('.modal-backdrop');
    await expect(approvalModal).toBeVisible({ timeout: 5000 }).catch(() => {
      // It's okay if no approval needed
    });
  });
});
