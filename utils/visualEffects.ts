import * as THREE from 'three';

export class ParticleSystem {
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private positions: Float32Array;
  private velocities: Float32Array;
  private count: number;

  constructor(count: number = 1000) {
    this.count = count;
    this.geometry = new THREE.BufferGeometry();

    // Create particle positions
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      // Spawn particles in a sphere
      const radius = Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      this.positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      this.positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      this.positions[i + 2] = radius * Math.cos(phi);

      // Random velocities
      this.velocities[i] = (Math.random() - 0.5) * 0.02;
      this.velocities[i + 1] = (Math.random() - 0.5) * 0.02;
      this.velocities[i + 2] = (Math.random() - 0.5) * 0.02;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    this.material = new THREE.PointsMaterial({
      color: 0xfb923c,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(this.geometry, this.material);
  }

  update(deltaTime: number = 0.016) {
    const positions = this.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.count * 3; i += 3) {
      positions[i] += this.velocities[i];
      positions[i + 1] += this.velocities[i + 1];
      positions[i + 2] += this.velocities[i + 2];

      // Reset particles that go too far
      const distance = Math.sqrt(
        positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2
      );

      if (distance > 10) {
        positions[i] = (Math.random() - 0.5) * 2;
        positions[i + 1] = (Math.random() - 0.5) * 2;
        positions[i + 2] = (Math.random() - 0.5) * 2;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  setColor(hue: number) {
    this.material.color.setHSL(hue / 360, 1, 0.5);
  }

  getMesh() {
    return this.particles;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

export class Starfield {
  private stars: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;

  constructor(count: number = 2000) {
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
    });

    this.stars = new THREE.Points(this.geometry, this.material);
  }

  getMesh() {
    return this.stars;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

export class GridFloor {
  private grid: THREE.GridHelper;

  constructor(size: number = 20, divisions: number = 20) {
    this.grid = new THREE.GridHelper(size, divisions, 0xfb923c, 0x444444);
    this.grid.position.y = -3;
  }

  getMesh() {
    return this.grid;
  }

  dispose() {
    this.grid.geometry.dispose();
    (this.grid.material as THREE.Material).dispose();
  }
}

// Utility function to create gradient background
export const createGradientBackground = (scene: THREE.Scene, topColor: number, bottomColor: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 2;
  const context = canvas.getContext('2d')!;

  const gradient = context.createLinearGradient(0, 0, 0, 2);
  gradient.addColorStop(0, `#${topColor.toString(16).padStart(6, '0')}`);
  gradient.addColorStop(1, `#${bottomColor.toString(16).padStart(6, '0')}`);

  context.fillStyle = gradient;
  context.fillRect(0, 0, 2, 2);

  const texture = new THREE.CanvasTexture(canvas);
  scene.background = texture;
};

// Apply rainbow color cycling to a shape
export const applyRainbowEffect = (shape: THREE.Mesh, time: number) => {
  const hue = (time * 50) % 360;
  (shape.material as THREE.MeshStandardMaterial).color.setHSL(hue / 360, 1, 0.5);
};

// Apply pulsing scale effect
export const applyPulseEffect = (shape: THREE.Mesh, time: number, baseScale: number = 1) => {
  const pulse = Math.sin(time * 2) * 0.2 + 1;
  const scale = baseScale * pulse;
  shape.scale.set(scale, scale, scale);
};

// Apply glow/emission effect
export const applyGlowEffect = (shape: THREE.Mesh, intensity: number = 1) => {
  const material = shape.material as THREE.MeshStandardMaterial;
  material.emissive = material.color.clone();
  material.emissiveIntensity = intensity * 0.5;
};

// Screenshot utility
export const takeScreenshot = (renderer: THREE.WebGLRenderer, filename: string = 'screenshot.png') => {
  const canvas = renderer.domElement;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  });
};
