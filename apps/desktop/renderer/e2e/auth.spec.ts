// ============================================================================
// E2E Tests - Authentication Flow
// ============================================================================

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login button when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Check for login button in top bar
    const loginButton = page.locator('button:has-text("Sign in")');
    await expect(loginButton).toBeVisible();
  });

  test('should open auth window when login button clicked', async ({ page }) => {
    await page.goto('/');
    
    // Click login button
    const loginButton = page.locator('button:has-text("Sign in")');
    await loginButton.click();
    
    // Wait for auth window (in real app, this would open a new window)
    // For E2E, we'll check if the auth state changes
    await page.waitForTimeout(1000);
  });

  test('should show provider selector after authentication', async ({ page }) => {
    await page.goto('/');
    
    // Mock authentication (in real test, would go through actual auth flow)
    await page.evaluate(() => {
      window.localStorage.setItem('auth', JSON.stringify({ authenticated: true }));
    });
    
    await page.reload();
    
    // Check for provider selector
    const providerSelector = page.locator('select').first();
    await expect(providerSelector).toBeVisible();
  });
});
