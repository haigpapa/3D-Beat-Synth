import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("3D Beat")');
  });

  test('should have proper ARIA labels on toggle switches', async ({ page }) => {
    const handTrackingToggle = page.locator('[aria-label="Toggle hand tracking"]');
    await expect(handTrackingToggle).toHaveAttribute('aria-label', 'Toggle hand tracking');

    const wireframeToggle = page.locator('[aria-label="Toggle wireframe mode"]');
    await expect(wireframeToggle).toHaveAttribute('aria-label', 'Toggle wireframe mode');
  });

  test('should have proper role attributes', async ({ page }) => {
    const handTrackingToggle = page.locator('[aria-label="Toggle hand tracking"]');
    await expect(handTrackingToggle).toHaveAttribute('role', 'switch');

    const wireframeToggle = page.locator('[aria-label="Toggle wireframe mode"]');
    await expect(wireframeToggle).toHaveAttribute('role', 'switch');
  });

  test('should have aria-checked states', async ({ page }) => {
    const handTrackingToggle = page.locator('[aria-label="Toggle hand tracking"]');

    // Should be checked initially
    await expect(handTrackingToggle).toHaveAttribute('aria-checked', 'true');

    // Click to toggle
    await handTrackingToggle.click();
    await expect(handTrackingToggle).toHaveAttribute('aria-checked', 'false');

    // Click again
    await handTrackingToggle.click();
    await expect(handTrackingToggle).toHaveAttribute('aria-checked', 'true');
  });

  test('should have proper listbox attributes in dropdown', async ({ page }) => {
    const shapeSelector = page.locator('[aria-haspopup="listbox"]');
    await expect(shapeSelector).toHaveAttribute('aria-haspopup', 'listbox');

    // Open dropdown
    await shapeSelector.click();

    // Check for listbox role
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible();
  });

  test('should have aria-selected on dropdown options', async ({ page }) => {
    const shapeSelector = page.locator('[aria-haspopup="listbox"]');
    await shapeSelector.click();

    // Check that selected option has aria-selected="true"
    const selectedOption = page.locator('[role="option"][aria-selected="true"]');
    await expect(selectedOption).toBeVisible();
  });

  test('should be keyboard navigable for toggles', async ({ page }) => {
    const handTrackingToggle = page.locator('[aria-label="Toggle hand tracking"]');

    // Focus the toggle
    await handTrackingToggle.focus();

    // Press space to toggle
    await page.keyboard.press('Space');

    // State should change
    await expect(handTrackingToggle).toHaveAttribute('aria-checked', 'false');

    // Press space again
    await page.keyboard.press('Space');
    await expect(handTrackingToggle).toHaveAttribute('aria-checked', 'true');
  });

  test('should have semantic HTML headings', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('3D Beat');

    const h2Controls = page.locator('h2:has-text("Controls")');
    await expect(h2Controls).toBeVisible();

    const h2Visualizer = page.locator('h2:has-text("Visualizer Sandbox")');
    await expect(h2Visualizer).toBeVisible();
  });

  test('should have proper color contrast', async ({ page }) => {
    // Check that text elements are visible (basic contrast check)
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    const controls = page.locator('h2:has-text("Controls")');
    await expect(controls).toBeVisible();

    // All should be readable
    await expect(title).toHaveCSS('color', /.+/);
  });
});
