
export type ShapeType = 'Sphere' | 'Cube' | 'Torus' | 'Cone' | 'Cylinder' | 'Dodecahedron' | 'Octahedron' | 'Tetrahedron';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  left: {
    detected: boolean;
    scale: number;
    colorHue: number;
    rotation: Vector3D;
    landmarks?: Array<{ x: number; y: number; z: number }>;
    confidence?: number;
  };
  right: {
    detected: boolean;
    liftedFingers: number;
    landmarks?: Array<{ x: number; y: number; z: number }>;
    confidence?: number;
  };
}

export interface PerformanceConfig {
  enabled: boolean;
  geometryDetail: 'low' | 'medium' | 'high';
  maxShapes: number;
  targetFrameRate: number;
  enablePostProcessing: boolean;
}

export interface ErrorState {
  type: 'camera' | 'mediapipe' | 'audio' | 'texture' | 'unknown';
  message: string;
  recoverable: boolean;
}
