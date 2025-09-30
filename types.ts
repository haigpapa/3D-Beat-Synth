
export type ShapeType = 'Sphere' | 'Cube' | 'Torus';

export interface HandData {
  left: {
    detected: boolean;
    scale: number;
    colorHue: number;
    rotation: { x: number; y: number; z: number };
  };
  right: {
    detected: boolean;
    liftedFingers: number;
  };
}
