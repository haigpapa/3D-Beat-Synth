import { test, expect } from '@playwright/test';

test.describe('Texture Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('h1:has-text("3D Beat")');
  });

  test('should display texture upload section', async ({ page }) => {
    const uploadSection = page.locator('h3:has-text("Upload Texture")');
    await expect(uploadSection).toBeVisible();
  });

  test('should display sample textures section', async ({ page }) => {
    const sampleSection = page.locator('h3:has-text("Sample Textures")');
    await expect(sampleSection).toBeVisible();
  });

  test('should have Grid Pattern button', async ({ page }) => {
    const gridButton = page.locator('button:has-text("Grid Pattern")');
    await expect(gridButton).toBeVisible();
  });

  test('should have Fingerprint button', async ({ page }) => {
    const fingerprintButton = page.locator('button:has-text("Fingerprint")');
    await expect(fingerprintButton).toBeVisible();
  });

  test('should apply Grid Pattern texture', async ({ page }) => {
    const gridButton = page.locator('button:has-text("Grid Pattern")');
    await gridButton.click();

    // The texture should be applied (we can't directly verify in the canvas,
    // but we can ensure the button click doesn't cause errors)
    await expect(gridButton).toBeVisible();
  });

  test('should apply Fingerprint texture', async ({ page }) => {
    const fingerprintButton = page.locator('button:has-text("Fingerprint")');
    await fingerprintButton.click();

    // The texture should be applied
    await expect(fingerprintButton).toBeVisible();
  });

  test('should switch between textures', async ({ page }) => {
    const gridButton = page.locator('button:has-text("Grid Pattern")');
    const fingerprintButton = page.locator('button:has-text("Fingerprint")');

    // Apply Grid
    await gridButton.click();
    await page.waitForTimeout(100);

    // Apply Fingerprint
    await fingerprintButton.click();
    await page.waitForTimeout(100);

    // Apply Grid again
    await gridButton.click();

    // Should complete without errors
    await expect(gridButton).toBeVisible();
  });

  test('should have file input for texture upload', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toHaveCount(1);
  });

  test('should accept correct image formats', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const acceptAttribute = await fileInput.getAttribute('accept');

    expect(acceptAttribute).toContain('image/jpeg');
    expect(acceptAttribute).toContain('image/png');
    expect(acceptAttribute).toContain('image/webp');
  });
});
