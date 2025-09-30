import { test, expect } from '@playwright/test';

test.describe('Visualizer Scaling', () => {
  test('should scale duplicated shapes correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Wait for the visualizer to be ready
    await page.waitForFunction(() => (window as any).threeStuff && (window as any).threeStuff.shapes.length > 0);

    // Trigger duplication of shapes
    await page.evaluate(() => {
      const { threeStuff } = (window as any);
      const visualizer = {
        triggerDuplication: (count: number) => {
          const { scene, shapes, audio } = threeStuff;
          if (!scene || !shapes || !shapes[0] || !audio) return;
          const original = shapes[0];
          const notes = ['C3', 'E3', 'G3', 'B3', 'D4'];
          const notesToPlay = [];

          for(let i=0; i < count; i++) {
            const newShape = original.clone();
            newShape.scale.multiplyScalar(Math.pow(1.25, shapes.length));

            // Random slight position offset
            newShape.position.x += (Math.random() - 0.5) * 2;
            newShape.position.y += (Math.random() - 0.5) * 2;
            newShape.position.z += (Math.random() - 0.5) * 2;

            scene.add(newShape);
            shapes.push(newShape);
            notesToPlay.push(notes[i % notes.length]);
          }
        }
      };
      visualizer.triggerDuplication(2);
    });

    // Check the scale of the duplicated shapes
    const scales = await page.evaluate(() => {
      const { shapes } = (window as any).threeStuff;
      return shapes.map((shape: any) => shape.scale.x);
    });

    expect(scales.length).toBe(3);
    expect(scales[0]).toBe(1);
    expect(scales[1]).toBeCloseTo(1.25);
    expect(scales[2]).toBeCloseTo(1.25 * 1.25);
  });
});