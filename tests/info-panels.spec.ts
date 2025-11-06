import { test, expect } from '@playwright/test';

test.describe('Info Panels', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('h1:has-text("3D Beat")');
  });

  test('should display Scale Information accordion', async ({ page }) => {
    const accordion = page.locator('text=Scale Information');
    await expect(accordion).toBeVisible();
  });

  test('should display Hand Data accordion', async ({ page }) => {
    const accordion = page.locator('text=Hand Data');
    await expect(accordion).toBeVisible();
  });

  test('should toggle Scale Information accordion', async ({ page }) => {
    const accordionButton = page.locator('button:has-text("Scale Information")');

    // Click to expand
    await accordionButton.click();

    // Content should be visible
    const content = page.locator('text=Musical Scale Mapping');
    await expect(content).toBeVisible();

    // Click to collapse
    await accordionButton.click();

    // Content should be hidden (with a slight delay for animation)
    await page.waitForTimeout(300);
    await expect(content).not.toBeVisible();
  });

  test('should toggle Hand Data accordion', async ({ page }) => {
    const accordionButton = page.locator('button:has-text("Hand Data")');

    // Click to expand
    await accordionButton.click();

    // Left/Right toggle should be visible
    const leftButton = page.locator('button:has-text("Left")').nth(1); // Second "Left" button (first is for accordion)
    await expect(leftButton).toBeVisible();
  });

  test('should display hand status badge', async ({ page }) => {
    const accordion = page.locator('button:has-text("Hand Data")');

    // Check for status badge (initially "No Hand Detected")
    const statusBadge = page.locator('text=No Hand Detected').or(page.locator('text=Hand Detected'));
    await expect(statusBadge).toBeVisible();
  });

  test('should switch between Left and Right hand data', async ({ page }) => {
    const accordionButton = page.locator('button:has-text("Hand Data")');
    await accordionButton.click();

    // Click Left button
    const leftButton = page.locator('button:has-text("Left")').last();
    await leftButton.click();

    // Click Right button
    const rightButton = page.locator('button:has-text("Right")').last();
    await rightButton.click();

    // Should still be visible (just changes displayed data)
    await expect(rightButton).toBeVisible();
  });

  test('should display musical scale notes', async ({ page }) => {
    const accordionButton = page.locator('button:has-text("Scale Information")');
    await accordionButton.click();

    // Check for note information
    const notes = ['C3', 'E3', 'G3', 'B3', 'D4'];

    for (const note of notes) {
      const noteElement = page.locator(`text=${note}`);
      await expect(noteElement).toBeVisible();
    }
  });

  test('should display frequency and harmonicity information', async ({ page }) => {
    const accordionButton = page.locator('button:has-text("Scale Information")');
    await accordionButton.click();

    // Check for frequency range
    await expect(page.locator('text=100Hz to 400Hz')).toBeVisible();

    // Check for harmonicity range
    await expect(page.locator('text=1.0 to 3.0')).toBeVisible();
  });
});
