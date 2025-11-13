import { test, expect } from '@playwright/test';

test.describe('Camera Controls', () => {
  test('should allow the user to select a camera', async ({ page }) => {
    await page.goto('/');

    // Check that the camera controls are visible when hand tracking is enabled
    const cameraControls = page.locator('#camera-select');
    await expect(cameraControls).toBeVisible();

    // Get the list of available cameras
    const cameraOptions = await cameraControls.evaluate((select: HTMLSelectElement) => {
      return Array.from(select.options).map(option => ({
        value: option.value,
        label: option.label,
      }));
    });

    // Check that there is at least one camera available
    expect(cameraOptions.length).toBeGreaterThan(0);

    // Select the first camera in the list
    await cameraControls.selectOption({ index: 0 });

    // Check that the selected camera is updated
    const selectedCamera = await cameraControls.evaluate((select: HTMLSelectElement) => select.value);
    expect(selectedCamera).toBe(cameraOptions[0].value);
  });
});
