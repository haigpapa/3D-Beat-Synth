
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { HandData, ShapeType } from '../types';
import { MusicNoteIcon, VolumeUpIcon, VolumeOffIcon } from './icons';

// Make sure to declare Tone and MediaPipe types as they are loaded from CDN
declare const Tone: any;
declare const vision: any;

interface VisualizerProps {
  isHandTracking: boolean;
  isWireframe: boolean;
  textureUrl: string | null;
  shapeType: ShapeType;
  isDroneSound: boolean;
  setDroneSound: (enabled: boolean) => void;
}

const Visualizer: React.FC<VisualizerProps> = ({
  isHandTracking,
  isWireframe,
  textureUrl,
  shapeType,
  isDroneSound,
  setDroneSound
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameId = useRef<number>();
  const handLandmarkerRef = useRef<any>(null);
  const threeStuff = useRef<any>({});
  const handDataRef = useRef<HandData>({
    left: { detected: false, scale: 0.5, colorHue: 38, rotation: { x: 0, y: 0, z: 0 } },
    right: { detected: false, liftedFingers: 0 },
  });
  const [handDisplay, setHandDisplay] = useState<HandData>(handDataRef.current);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupMediaPipe = useCallback(async () => {
    try {
      const vision = (window as any).vision;
      if (!vision) throw new Error('MediaPipe vision library not loaded.');
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      const handLandmarker = await vision.HandLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });
      handLandmarkerRef.current = handLandmarker;
    } catch (e) {
        console.error("Failed to initialize MediaPipe Hand Landmarker", e);
        setError("Failed to load hand tracking model. Please ensure you have a modern browser and a stable connection.");
    }
  }, []);

  const setupThreeScene = useCallback(() => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.position.z = 5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xfb923c, wireframe: true });
    const mainShape = new THREE.Mesh(geometry, material);
    scene.add(mainShape);

    threeStuff.current = { renderer, scene, camera, shapes: [mainShape] };
  }, []);

  const setupTone = useCallback(() => {
    const drone = new Tone.AMSynth({
        harmonicity: 1.5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.5, decay: 0.01 }
    }).toDestination();
    drone.volume.value = -20;
    
    const polySynth = new Tone.PolySynth(Tone.MembraneSynth).toDestination();
    polySynth.volume.value = -10;
    
    threeStuff.current.audio = { drone, polySynth };
  }, []);

  useEffect(() => {
    const init = async () => {
        setIsReady(false);
        await setupMediaPipe();
        setupThreeScene();
        setupTone();
        setIsReady(true);
    };
    init();
  }, [setupMediaPipe, setupThreeScene, setupTone]);
  
  const predictWebcam = useCallback(() => {
    if (!isReady || !handLandmarkerRef.current || !videoRef.current || !threeStuff.current.scene) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }
    const video = videoRef.current;
    if (video.readyState < 2) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }
    const results = handLandmarkerRef.current.detectForVideo(video, Date.now());
    processHandResults(results);
    setHandDisplay({...handDataRef.current});
    updateScene();
    
    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, [isReady]);

  useEffect(() => {
      if (isHandTracking && isReady) {
          navigator.mediaDevices.getUserMedia({ video: true })
              .then(stream => {
                  if (videoRef.current) {
                      videoRef.current.srcObject = stream;
                      videoRef.current.addEventListener('loadeddata', () => {
                          if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
                          animationFrameId.current = requestAnimationFrame(predictWebcam);
                      });
                  }
              })
              .catch(err => {
                  console.error("error accessing webcam", err);
                  setError("Webcam access denied. Please enable camera permissions for this site.");
              });
      } else {
          if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
          if (videoRef.current && videoRef.current.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream;
              stream.getTracks().forEach(track => track.stop());
              videoRef.current.srcObject = null;
          }
      }
      return () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      };
  }, [isHandTracking, isReady, predictWebcam]);
  
  const processHandResults = (results: any) => {
    handDataRef.current.left.detected = false;
    handDataRef.current.right.detected = false;
    
    if (results.landmarks) {
      results.landmarks.forEach((landmark: any, index: number) => {
        const handedness = results.handednesses[index][0].categoryName;
        
        if (handedness === 'Left') {
          handDataRef.current.left.detected = true;
          const thumbTip = landmark[4];
          const pinkyTip = landmark[20];
          const indexTip = landmark[8];
          const wrist = landmark[0];

          const scaleDist = Math.hypot(thumbTip.x - pinkyTip.x, thumbTip.y - pinkyTip.y, thumbTip.z - pinkyTip.z);
          handDataRef.current.left.scale = THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(scaleDist, 0.05, 0.3, 0.2, 2.0), 0.2, 2.0);
          
          const colorDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y, thumbTip.z - indexTip.z);
          handDataRef.current.left.colorHue = THREE.MathUtils.mapLinear(colorDist, 0.02, 0.2, 0, 360);
          
          handDataRef.current.left.rotation = {
              x: (wrist.y - 0.5) * Math.PI,
              y: (wrist.x - 0.5) * Math.PI,
              z: 0
          };
        } else if (handedness === 'Right') {
          handDataRef.current.right.detected = true;
          const isThumbUp = landmark[4].y < landmark[3].y;
          const isIndexUp = landmark[8].y < landmark[7].y;
          const isMiddleUp = landmark[12].y < landmark[11].y;
          const isRingUp = landmark[16].y < landmark[15].y;
          const isPinkyUp = landmark[20].y < landmark[19].y;
          const liftedFingers = [isThumbUp, isIndexUp, isMiddleUp, isRingUp, isPinkyUp].filter(Boolean).length;
          
          if (handDataRef.current.right.liftedFingers !== liftedFingers) {
             const prevFingers = handDataRef.current.right.liftedFingers;
             handDataRef.current.right.liftedFingers = liftedFingers;
             if(liftedFingers > prevFingers) {
                 triggerDuplication(liftedFingers - prevFingers);
             }
          }
        }
      });
    }
  };

  const triggerDuplication = (count: number) => {
      const { scene, shapes, audio } = threeStuff.current;
      if (!scene || !shapes || !shapes[0] || !audio) return;
      const original = shapes[0];
      const notes = ['C3', 'E3', 'G3', 'B3', 'D4'];
      const notesToPlay = [];

      for(let i=0; i < count; i++) {
        const newShape = original.clone();
        newShape.scale.multiplyScalar(1.25 * (shapes.length + 1));
        
        // Random slight position offset
        newShape.position.x += (Math.random() - 0.5) * 2;
        newShape.position.y += (Math.random() - 0.5) * 2;
        newShape.position.z += (Math.random() - 0.5) * 2;
        
        scene.add(newShape);
        shapes.push(newShape);
        notesToPlay.push(notes[i % notes.length]);
      }
      
      if(notesToPlay.length > 0) {
          audio.polySynth.triggerAttackRelease(notesToPlay, '8n');
      }
      
      // Limit number of shapes
      while(shapes.length > 10) {
          const oldShape = shapes.splice(1, 1)[0];
          scene.remove(oldShape);
          oldShape.geometry.dispose();
          (oldShape.material as THREE.Material).dispose();
      }
  };
  
  const updateScene = () => {
    const { renderer, scene, camera, shapes, audio } = threeStuff.current;
    if (!renderer || !scene || !camera || !shapes || !shapes[0] || !audio) return;
    
    const mainShape = shapes[0];
    const { left } = handDataRef.current;
    
    if (left.detected) {
      mainShape.scale.set(left.scale, left.scale, left.scale);
      (mainShape.material as THREE.MeshStandardMaterial).color.setHSL(left.colorHue / 360, 1, 0.5);
      mainShape.rotation.set(left.rotation.x, left.rotation.y, left.rotation.z);
      
      if(isDroneSound && audio.drone.state !== 'started') {
        audio.drone.triggerAttack('C2');
      }
      audio.drone.frequency.value = 100 + (left.scale - 0.2) * 200;
      audio.drone.harmonicity.value = 1 + (left.colorHue / 360) * 2;
      
    } else {
        if (isDroneSound && audio.drone.state === 'started') {
            audio.drone.triggerRelease();
        }
    }
    
    renderer.render(scene, camera);
  };
  
  useEffect(() => {
    if(!isReady) return;
    const { drone } = threeStuff.current.audio;
    if (!isDroneSound && drone.state === 'started') {
      drone.triggerRelease();
    }
  }, [isDroneSound, isReady]);

  useEffect(() => {
    if(!isReady) return;
    const { shapes } = threeStuff.current;
    shapes.forEach((shape: THREE.Mesh) => {
        (shape.material as THREE.MeshStandardMaterial).wireframe = isWireframe;
    });
  }, [isWireframe, isReady]);
  
  useEffect(() => {
    if (!textureUrl || !isReady) return;
    const { shapes } = threeStuff.current;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(textureUrl, (texture) => {
      shapes.forEach((shape: THREE.Mesh) => {
        (shape.material as THREE.MeshStandardMaterial).map = texture;
        (shape.material as THREE.MeshStandardMaterial).needsUpdate = true;
      });
    });
  }, [textureUrl, isReady]);
  
  const handleDroneToggle = async () => {
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }
    setDroneSound(!isDroneSound);
  }

  return (
    <div className="relative w-full h-[400px] lg:h-full rounded-lg bg-gray-900 border border-gray-800 p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Visualizer Sandbox</h2>
        <button onClick={handleDroneToggle} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md hover:bg-gray-800/50 transition-colors">
            <MusicNoteIcon className="w-4 h-4" />
            Drone Sound
            {isDroneSound ? <VolumeUpIcon className="w-4 h-4 text-green-400" /> : <VolumeOffIcon className="w-4 h-4 text-gray-500" />}
        </button>
      </div>
      
      <div className="absolute top-16 left-6 text-xs font-mono z-10 p-2 bg-black/30 rounded">
        <p className={handDisplay.left.detected ? 'text-blue-400' : 'text-gray-500'}>
            LEFT HAND CONTROLS ({handDisplay.left.detected ? 'ACTIVE' : 'NOT DETECTED'})
        </p>
        <p>Thumb-Pinky: Scale ({handDisplay.left.scale.toFixed(2)}x)</p>
        <div className="flex items-center gap-2">
            <span>Thumb-Index: Color ({Math.round(handDisplay.left.colorHue)}°)</span>
            <span className="w-3 h-3 rounded-full" style={{backgroundColor: `hsl(${handDisplay.left.colorHue}, 100%, 50%)`}}></span>
        </div>
        <p>Hand Orientation: Controls 3D Rotation</p>
        <br/>
        <p className={handDisplay.right.detected ? 'text-green-400' : 'text-gray-500'}>
            RIGHT HAND CONTROLS ({handDisplay.right.detected ? 'ACTIVE' : 'NOT DETECTED'})
        </p>
        <p>{handDisplay.right.liftedFingers} Lifted Fingers - Creates {handDisplay.right.liftedFingers} shape copies</p>
        <p>Each copy is 1.25x larger than the previous</p>
      </div>
      
      <div className="absolute top-16 right-6 text-xs z-10 p-2 bg-black/30 rounded">
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400"></span>
            <span>Left Hand: Color, Scale & Rotation</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
            <span>Right Hand: Duplicate Shapes</span>
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-full rounded-md" />
      <video ref={videoRef} autoPlay playsInline className="absolute bottom-6 right-6 w-48 h-36 rounded-md shadow-lg border-2 border-gray-700 object-cover" style={{ transform: 'scaleX(-1)' }} />
      {!isReady && <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center"><p>Loading 3D Synth...</p></div>}
      {error && <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center text-center p-4"><p className="text-red-400">{error}</p></div>}
    </div>
  );
};

export default Visualizer;
