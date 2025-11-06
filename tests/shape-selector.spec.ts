import { test, expect } from '@playwright/test';

test.describe('Shape Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('h1:has-text("3D Beat")');
  });

  test('should display shape selector with default shape', async ({ page }) => {
    const shapeSelector = page.locator('[aria-haspopup="listbox"]');
    await expect(shapeSelector).toBeVisible();
    await expect(shapeSelector).toContainText('Sphere');
  });

  test('should open dropdown when clicked', async ({ page }) => {
    const shapeSelector = page.locator('[aria-haspopup="listbox"]');
    await shapeSelector.click();

    // Dropdown should be visible
    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).toBeVisible();
  });

  test('should display all shape options', async ({ page }) => {
    const shapeSelector = page.locator('[aria-haspopup="listbox"]');
    await shapeSelector.click();

    const expectedShapes = [
      'Sphere',
      'Cube',
      'Torus',
      'Cone',
      'Cylinder',
      'Dodecahedron',
      'Octahedron',
      'Tetrahedron'
    ];

    for (const shape of expectedShapes) {
      const option = page.locator(`[role="option"]:has-text("${shape}")`);
      await expect(option).toBeVisible();
    }
  });

  test('should select different shape', async ({ page }) => {
    const shapeSelector = page.locator('[aria-haspopup="listbox"]');

    // Open dropdown
    await shapeSelector.click();

    // Select Cube
    await page.locator('[role="option"]:has-text("Cube")').click();

    // Verify selection
    await expect(shapeSelector).toContainText('Cube');
  });

  test('should close dropdown after selection', async ({ page }) => {
    const shapeSelector = page.locator('[aria-haspopup="listbox"]');

    // Open dropdown
    await shapeSelector.click();

    // Select a shape
    await page.locator('[role="option"]:has-text("Torus")').click();

    // Dropdown should be closed
    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).not.toBeVisible();
  });

  test('should cycle through multiple shapes', async ({ page }) => {
    const shapeSelector = page.locator('[aria-haspopup="listbox"]');
    const shapes = ['Cube', 'Cone', 'Cylinder'];

    for (const shape of shapes) {
      await shapeSelector.click();
      await page.locator(`[role="option"]:has-text("${shape}")`).click();
      await expect(shapeSelector).toContainText(shape);
    }
  });
});
