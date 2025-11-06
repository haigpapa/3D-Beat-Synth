import { test, expect } from '@playwright/test';

test.describe('UI Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Wait for the app to load
    await page.waitForSelector('h1:has-text("3D Beat")');
  });

  test('should display main title', async ({ page }) => {
    const title = await page.locator('h1').textContent();
    expect(title).toContain('3D Beat');
    expect(title).toContain('Synth');
  });

  test('should toggle hand tracking', async ({ page }) => {
    const toggle = page.locator('[aria-label="Toggle hand tracking"]');

    // Check initial state (should be checked)
    await expect(toggle).toBeChecked();

    // Toggle off
    await toggle.click();
    await expect(toggle).not.toBeChecked();

    // Toggle back on
    await toggle.click();
    await expect(toggle).toBeChecked();
  });

  test('should toggle wireframe mode', async ({ page }) => {
    const toggle = page.locator('[aria-label="Toggle wireframe mode"]');

    // Check initial state (should be checked)
    await expect(toggle).toBeChecked();

    // Toggle off
    await toggle.click();
    await expect(toggle).not.toBeChecked();

    // Toggle back on
    await toggle.click();
    await expect(toggle).toBeChecked();
  });

  test('should toggle performance mode', async ({ page }) => {
    const button = page.locator('button:has-text("Performance Mode")');

    // Initially should not be in performance mode
    await expect(button).toBeVisible();

    // Click to enable performance mode
    await button.click();

    // Button should still be visible (state changes internally)
    await expect(button).toBeVisible();
  });

  test('should display visualizer sandbox', async ({ page }) => {
    const visualizer = page.locator('h2:has-text("Visualizer Sandbox")');
    await expect(visualizer).toBeVisible();
  });

  test('should display controls section', async ({ page }) => {
    const controls = page.locator('h2:has-text("Controls")');
    await expect(controls).toBeVisible();
  });

  test('should have canvas element', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should have video element for camera feed', async ({ page }) => {
    const video = page.locator('video');
    await expect(video).toBeVisible();
  });
});
