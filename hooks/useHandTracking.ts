import { useRef, useCallback, useState, useEffect } from 'react';
import { HandData } from '../types';
import { HandLandmarker, HandLandmarkerResult, VisionStatic, Landmark } from '../types/external';
import * as THREE from 'three';

interface UseHandTrackingOptions {
  enabled: boolean;
  onError?: (error: Error) => void;
}

export const useHandTracking = ({ enabled, onError }: UseHandTrackingOptions) => {
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameId = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  const [handData, setHandData] = useState<HandData>({
    left: { detected: false, scale: 0.5, colorHue: 38, rotation: { x: 0, y: 0, z: 0 } },
    right: { detected: false, liftedFingers: 0 },
  });

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize MediaPipe
  const setupMediaPipe = useCallback(async () => {
    try {
      console.log('Initializing MediaPipe...');
      const vision: VisionStatic = window.vision;
      if (!vision) {
        throw new Error('MediaPipe vision library not loaded. Please check your internet connection.');
      }

      console.log('MediaPipe vision library found, loading fileset resolver...');
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
      );

      console.log('Fileset resolver loaded, creating hand landmarker...');
      const handLandmarker = await vision.HandLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
      });

      console.log('Hand landmarker created successfully');
      handLandmarkerRef.current = handLandmarker;
      setIsReady(true);
      setError(null); // Clear any previous errors
    } catch (e) {
      const errorMsg = 'Failed to load hand tracking model. Please ensure you have a modern browser and stable internet connection.';
      console.error('Failed to initialize MediaPipe Hand Landmarker:', e);
      setError(errorMsg);
      if (onError) {
        onError(new Error(errorMsg));
      }
    }
  }, [onError]);

  // Process hand tracking results
  const processHandResults = useCallback((results: HandLandmarkerResult, onHandDataUpdate?: (data: HandData) => void) => {
    const newHandData: HandData = {
      left: { detected: false, scale: 0.5, colorHue: 38, rotation: { x: 0, y: 0, z: 0 } },
      right: { detected: false, liftedFingers: 0 },
    };

    if (results.landmarks && results.landmarks.length > 0) {
      results.landmarks.forEach((landmark: Landmark[], index: number) => {
        const handedness = results.handednesses[index][0].categoryName;
        const confidence = results.handednesses[index][0].score;

        if (handedness === 'Left') {
          newHandData.left.detected = true;
          newHandData.left.confidence = confidence;
          newHandData.left.landmarks = landmark;

          // Calculate scale from thumb-pinky distance
          const thumbTip = landmark[4];
          const pinkyTip = landmark[20];
          const scaleDist = Math.hypot(
            thumbTip.x - pinkyTip.x,
            thumbTip.y - pinkyTip.y,
            thumbTip.z - pinkyTip.z
          );
          newHandData.left.scale = THREE.MathUtils.clamp(
            THREE.MathUtils.mapLinear(scaleDist, 0.05, 0.3, 0.2, 2.0),
            0.2,
            2.0
          );

          // Calculate color from thumb-index distance
          const indexTip = landmark[8];
          const colorDist = Math.hypot(
            thumbTip.x - indexTip.x,
            thumbTip.y - indexTip.y,
            thumbTip.z - indexTip.z
          );
          newHandData.left.colorHue = THREE.MathUtils.mapLinear(colorDist, 0.02, 0.2, 0, 360);

          // Calculate rotation from wrist position
          const wrist = landmark[0];
          newHandData.left.rotation = {
            x: (wrist.y - 0.5) * Math.PI,
            y: (wrist.x - 0.5) * Math.PI,
            z: 0,
          };
        } else if (handedness === 'Right') {
          newHandData.right.detected = true;
          newHandData.right.confidence = confidence;
          newHandData.right.landmarks = landmark;

          // Count lifted fingers
          const isThumbUp = landmark[4].y < landmark[3].y;
          const isIndexUp = landmark[8].y < landmark[7].y;
          const isMiddleUp = landmark[12].y < landmark[11].y;
          const isRingUp = landmark[16].y < landmark[15].y;
          const isPinkyUp = landmark[20].y < landmark[19].y;

          newHandData.right.liftedFingers = [
            isThumbUp,
            isIndexUp,
            isMiddleUp,
            isRingUp,
            isPinkyUp,
          ].filter(Boolean).length;
        }
      });
    }

    setHandData(newHandData);
    if (onHandDataUpdate) {
      onHandDataUpdate(newHandData);
    }

    return newHandData;
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      console.log('Camera access granted, stream obtained:', stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Wait for video metadata to load and then play
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not found'));
            return;
          }

          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => {
                  console.log('Video playing successfully');
                  resolve();
                })
                .catch(reject);
            }
          };
        });

        console.log('Camera started successfully');
        setError(null); // Clear any previous errors
      }
    } catch (err) {
      const errorMsg = 'Camera access denied. Please enable camera permissions for this site.';
      console.error('Error accessing webcam:', err);
      setError(errorMsg);
      if (onError) {
        onError(new Error(errorMsg));
      }
    }
  }, [onError]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }, []);

  // Detect hands from video frame
  const detectHands = useCallback((onHandDataUpdate?: (data: HandData) => void) => {
    if (!isReady || !handLandmarkerRef.current || !videoRef.current) {
      return null;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      return null;
    }

    try {
      const results = handLandmarkerRef.current.detectForVideo(video, Date.now());
      return processHandResults(results, onHandDataUpdate);
    } catch (err) {
      console.error('Error detecting hands', err);
      return null;
    }
  }, [isReady, processHandResults]);

  // Initialize on mount
  useEffect(() => {
    setupMediaPipe();
    return () => {
      stopCamera();
    };
  }, [setupMediaPipe, stopCamera]);

  // Handle enabled state changes
  useEffect(() => {
    console.log('Hand tracking state changed - enabled:', enabled, 'isReady:', isReady);
    if (enabled && isReady) {
      console.log('Starting camera...');
      startCamera();
    } else {
      console.log('Stopping camera...');
      stopCamera();
    }
  }, [enabled, isReady, startCamera, stopCamera]);

  return {
    videoRef,
    handData,
    isReady,
    error,
    detectHands,
    animationFrameId,
  };
};
