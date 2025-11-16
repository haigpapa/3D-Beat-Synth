import { useRef, useCallback, useEffect, useState, RefObject } from 'react';
import * as THREE from 'three';
import { ShapeType, PerformanceConfig } from '../types';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

interface UseThreeSceneOptions {
  canvasRef: RefObject<HTMLCanvasElement>;
  shapeType: ShapeType;
  isWireframe: boolean;
  textureUrl: string | null;
  performanceConfig: PerformanceConfig;
}

// Geometry detail configurations
const GEOMETRY_CONFIGS = {
  low: { sphere: [1, 16, 16], cone: [1, 2, 16], cylinder: [1, 1, 2, 16] },
  medium: { sphere: [1, 32, 32], cone: [1, 2, 32], cylinder: [1, 1, 2, 32] },
  high: { sphere: [1, 64, 64], cone: [1, 2, 64], cylinder: [1, 1, 2, 64] },
};

export const useThreeScene = ({
  canvasRef,
  shapeType,
  isWireframe,
  textureUrl,
  performanceConfig,
}: UseThreeSceneOptions) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const shapesRef = useRef<THREE.Mesh[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Create geometry based on shape type and performance config
  const createGeometry = useCallback((type: ShapeType): THREE.BufferGeometry => {
    const detail = performanceConfig.geometryDetail;
    const config = GEOMETRY_CONFIGS[detail];

    switch (type) {
      case 'Sphere':
        return new THREE.SphereGeometry(...config.sphere);
      case 'Cube':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'Torus':
        return new THREE.TorusGeometry(1, 0.4, 16, 32);
      case 'Cone':
        return new THREE.ConeGeometry(...config.cone);
      case 'Cylinder':
        return new THREE.CylinderGeometry(...config.cylinder);
      case 'Dodecahedron':
        return new THREE.DodecahedronGeometry(1, 0);
      case 'Octahedron':
        return new THREE.OctahedronGeometry(1, 0);
      case 'Tetrahedron':
        return new THREE.TetrahedronGeometry(1, 0);
      default:
        return new THREE.SphereGeometry(...config.sphere);
    }
  }, [performanceConfig.geometryDetail]);

  // Initialize Three.js scene
  const initialize = useCallback(() => {
    if (!canvasRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: !performanceConfig.enabled,
      alpha: true,
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(performanceConfig.enabled ? 1 : window.devicePixelRatio);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create initial shape
    const geometry = createGeometry(shapeType);
    const material = new THREE.MeshStandardMaterial({
      color: 0xfb923c,
      wireframe: isWireframe,
    });
    const mainShape = new THREE.Mesh(geometry, material);
    scene.add(mainShape);
    shapesRef.current = [mainShape];

    // Setup post-processing if enabled
    if (performanceConfig.enablePostProcessing) {
      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(canvasRef.current.clientWidth, canvasRef.current.clientHeight),
        0.5,
        0.4,
        0.85
      );
      composer.addPass(bloomPass);
      composerRef.current = composer;
    }

    setIsReady(true);
  }, [canvasRef, shapeType, isWireframe, performanceConfig, createGeometry]);

  // Update main shape properties
  const updateMainShape = useCallback((
    scale: number,
    colorHue: number,
    rotation: { x: number; y: number; z: number }
  ) => {
    if (!shapesRef.current[0]) return;

    const mainShape = shapesRef.current[0];
    mainShape.scale.set(scale, scale, scale);
    (mainShape.material as THREE.MeshStandardMaterial).color.setHSL(colorHue / 360, 1, 0.5);
    mainShape.rotation.set(rotation.x, rotation.y, rotation.z);
  }, []);

  // Duplicate shape
  const duplicateShape = useCallback((count: number, scaleFactor = 1.25) => {
    if (!sceneRef.current || !shapesRef.current[0]) return;

    const scene = sceneRef.current;
    const original = shapesRef.current[0];
    const newShapes: THREE.Mesh[] = [];

    for (let i = 0; i < count; i++) {
      const newShape = original.clone();
      newShape.scale.multiplyScalar(Math.pow(scaleFactor, shapesRef.current.length));

      // Random position offset
      newShape.position.x += (Math.random() - 0.5) * 2;
      newShape.position.y += (Math.random() - 0.5) * 2;
      newShape.position.z += (Math.random() - 0.5) * 2;

      scene.add(newShape);
      shapesRef.current.push(newShape);
      newShapes.push(newShape);
    }

    // Limit number of shapes based on performance config
    while (shapesRef.current.length > performanceConfig.maxShapes) {
      const oldShape = shapesRef.current.splice(1, 1)[0];
      scene.remove(oldShape);
      oldShape.geometry.dispose();
      (oldShape.material as THREE.Material).dispose();
    }

    return newShapes;
  }, [performanceConfig.maxShapes]);

  // Remove all shapes except the main one
  const clearShapes = useCallback(() => {
    if (!sceneRef.current) return;

    while (shapesRef.current.length > 1) {
      const shape = shapesRef.current.pop()!;
      sceneRef.current.remove(shape);
      shape.geometry.dispose();
      (shape.material as THREE.Material).dispose();
    }
  }, []);

  // Render scene
  const render = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    if (composerRef.current && performanceConfig.enablePostProcessing) {
      composerRef.current.render();
    } else {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [performanceConfig.enablePostProcessing]);

  // Update wireframe mode
  useEffect(() => {
    if (!isReady) return;

    shapesRef.current.forEach((shape) => {
      (shape.material as THREE.MeshStandardMaterial).wireframe = isWireframe;
    });
  }, [isWireframe, isReady]);

  // Update texture
  useEffect(() => {
    if (!textureUrl || !isReady) return;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      textureUrl,
      (texture) => {
        shapesRef.current.forEach((shape) => {
          (shape.material as THREE.MeshStandardMaterial).map = texture;
          (shape.material as THREE.MeshStandardMaterial).needsUpdate = true;
        });
      },
      undefined,
      (error) => {
        console.error('Failed to load texture', error);
      }
    );
  }, [textureUrl, isReady]);

  // Update shape type
  useEffect(() => {
    if (!isReady || !shapesRef.current[0]) return;

    const mainShape = shapesRef.current[0];
    const oldGeometry = mainShape.geometry;
    const newGeometry = createGeometry(shapeType);

    mainShape.geometry = newGeometry;
    oldGeometry.dispose();

    // Update all duplicated shapes
    for (let i = 1; i < shapesRef.current.length; i++) {
      const shape = shapesRef.current[i];
      const oldGeo = shape.geometry;
      shape.geometry = newGeometry.clone();
      oldGeo.dispose();
    }
  }, [shapeType, isReady, createGeometry]);

  // Initialize on mount
  useEffect(() => {
    initialize();

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);

      if (composerRef.current) {
        composerRef.current.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      // Cleanup
      if (sceneRef.current) {
        shapesRef.current.forEach((shape) => {
          shape.geometry.dispose();
          (shape.material as THREE.Material).dispose();
        });
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [initialize, canvasRef]);

  return {
    isReady,
    updateMainShape,
    duplicateShape,
    clearShapes,
    render,
    shapes: shapesRef.current,
  };
};
