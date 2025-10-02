import { test, expect } from '@playwright/test';

test.describe('Visualizer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should scale duplicated shapes correctly', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).testing.triggerDuplication(1);
    });

    const scales = await page.evaluate(() => {
      const visualizer = (window as any).testing.threeStuff.current;
      return visualizer.shapes.map((shape: any) => shape.scale.x);
    });

    expect(scales.length).toBe(2);
    expect(scales[1]).toBeCloseTo(scales[0] * 1.25);
  });
});