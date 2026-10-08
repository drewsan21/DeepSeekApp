// ============================================================================
// E2E Tests - Browser Tab Management
// ============================================================================

import { test, expect } from '@playwright/test';

test.describe('Browser Tab Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to browser view
    await page.click('button:has-text("Browser")');
  });

  test('should display browser view with tab strip', async ({ page }) => {
    // Check for tab strip
    const tabStrip = page.locator('.tabs');
    await expect(tabStrip).toBeVisible();
  });

  test('should create new tab when URL entered', async ({ page }) => {
    // Enter URL in toolbar
    const urlInput = page.locator('.toolbar input');
    await urlInput.fill('https://example.com');
    
    // Press Enter or click Go button
    const goButton = page.locator('button:has-text("Go")');
    await goButton.click();
    
    // Wait for tab to be created
    await page.waitForTimeout(1000);
    
    // Check that tab appears in tab strip
    const tabs = page.locator('.tab');
    await expect(tabs).toHaveCount(await tabs.count() + 1);
  });

  test('should switch between tabs', async ({ page }) => {
    // Create multiple tabs
    const urlInput = page.locator('.toolbar input');
    
    await urlInput.fill('https://example.com');
    await page.click('button:has-text("Go")');
    await page.waitForTimeout(500);
    
    await urlInput.fill('https://test.com');
    await page.click('button:has-text("Go")');
    await page.waitForTimeout(500);
    
    // Click on first tab
    const firstTab = page.locator('.tab').first();
    await firstTab.click();
    
    // Verify it's active
    await expect(firstTab).toHaveClass(/active/);
  });

  test('should close tab when close button clicked', async ({ page }) => {
    // Create a tab
    const urlInput = page.locator('.toolbar input');
    await urlInput.fill('https://example.com');
    await page.click('button:has-text("Go")');
    await page.waitForTimeout(500);
    
    const initialTabCount = await page.locator('.tab').count();
    
    // Click close button on the tab
    const closeButton = page.locator('.tab button').first();
    await closeButton.click();
    
    // Wait for tab to close
    await page.waitForTimeout(500);
    
    // Verify tab count decreased
    const finalTabCount = await page.locator('.tab').count();
    expect(finalTabCount).toBe(initialTabCount - 1);
  });
});
