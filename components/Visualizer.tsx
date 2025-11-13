import React, { useRef, useEffect, useCallback, useState } from 'react';
import { HandData, ShapeType, PerformanceConfig, ErrorState } from '../types';
import { MusicNoteIcon, VolumeUpIcon, VolumeOffIcon } from './icons';
import { useHandTracking } from '../hooks/useHandTracking';
import { useAudioSynth } from '../hooks/useAudioSynth';
import { useThreeScene } from '../hooks/useThreeScene';
import ErrorAlert from './ErrorAlert';

interface VisualizerProps {
  isHandTracking: boolean;
  isWireframe: boolean;
  textureUrl: string | null;
  shapeType: ShapeType;
  isDroneSound: boolean;
  setDroneSound: (enabled: boolean) => void;
  performanceConfig: PerformanceConfig;
  onHandDataUpdate?: (data: HandData) => void;
}

const NOTES = ['C3', 'E3', 'G3', 'B3', 'D4'];

const Visualizer: React.FC<VisualizerProps> = ({
  isHandTracking,
  isWireframe,
  textureUrl,
  shapeType,
  isDroneSound,
  setDroneSound,
  performanceConfig,
  onHandDataUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const previousLiftedFingersRef = useRef(0);
  const [handDisplay, setHandDisplay] = useState<HandData>({
    left: { detected: false, scale: 0.5, colorHue: 38, rotation: { x: 0, y: 0, z: 0 } },
    right: { detected: false, liftedFingers: 0 },
  });

  // Initialize hooks
  const { videoRef, handData, isReady: handTrackingReady, error: handTrackingError, detectHands, animationFrameId } = useHandTracking({
    enabled: isHandTracking,
    onError: (err) => setError({ type: 'camera', message: err.message, recoverable: true }),
  });

  const {
    isReady: audioReady,
    startDrone,
    stopDrone,
    updateDrone,
    playNotes,
    startAudioContext,
  } = useAudioSynth({
    onError: (err) => setError({ type: 'audio', message: err.message, recoverable: true }),
  });

  const { isReady: sceneReady, updateMainShape, duplicateShape, render } = useThreeScene({
    canvasRef,
    shapeType,
    isWireframe,
    textureUrl,
    performanceConfig,
  });

  const isReady = handTrackingReady && audioReady && sceneReady;

  // Handle hand data updates and trigger duplication
  const handleHandDataUpdate = useCallback(
    (newHandData: HandData) => {
      setHandDisplay(newHandData);

      if (onHandDataUpdate) {
        onHandDataUpdate(newHandData);
      }

      // Check for finger count change (right hand)
      if (newHandData.right.detected) {
        const currentFingers = newHandData.right.liftedFingers;
        const prevFingers = previousLiftedFingersRef.current;

        if (currentFingers > prevFingers) {
          const count = currentFingers - prevFingers;
          duplicateShape(count);

          // Play notes
          const notesToPlay = [];
          for (let i = 0; i < count; i++) {
            notesToPlay.push(NOTES[i % NOTES.length]);
          }
          playNotes(notesToPlay, '8n');
        }

        previousLiftedFingersRef.current = currentFingers;
      }
    },
    [onHandDataUpdate, duplicateShape, playNotes]
  );

  // Animation loop
  const animate = useCallback(() => {
    if (!sceneReady) {
      animationFrameId.current = requestAnimationFrame(animate);
      return;
    }

    // Detect hands and process results (only if hand tracking is enabled)
    if (isHandTracking && handTrackingReady) {
      const currentHandData = detectHands(handleHandDataUpdate);

      if (currentHandData && currentHandData.left.detected) {
        // Update main shape
        updateMainShape(
          currentHandData.left.scale,
          currentHandData.left.colorHue,
          currentHandData.left.rotation
        );

        // Update drone sound
        if (isDroneSound) {
          const frequency = 100 + (currentHandData.left.scale - 0.2) * 200;
          const harmonicity = 1 + (currentHandData.left.colorHue / 360) * 2;
          updateDrone(frequency, harmonicity);
          startDrone(frequency, harmonicity);
        }
      } else {
        // Stop drone if hand not detected
        if (isDroneSound) {
          stopDrone();
        }
      }
    } else {
      // If hand tracking is disabled, animate with default values
      const time = Date.now() * 0.001;
      updateMainShape(
        1.0,
        (time * 30) % 360, // Slowly cycling hue
        { x: Math.sin(time * 0.5) * 0.3, y: time * 0.3, z: 0 }
      );
    }

    // Render scene
    render();

    // Continue animation loop based on performance config
    if (performanceConfig.enabled && performanceConfig.targetFrameRate < 60) {
      setTimeout(() => {
        animationFrameId.current = requestAnimationFrame(animate);
      }, 1000 / performanceConfig.targetFrameRate);
    } else {
      animationFrameId.current = requestAnimationFrame(animate);
    }
  }, [
    sceneReady,
    isHandTracking,
    handTrackingReady,
    detectHands,
    handleHandDataUpdate,
    updateMainShape,
    isDroneSound,
    updateDrone,
    startDrone,
    stopDrone,
    render,
    performanceConfig,
  ]);

  // Start/stop animation loop when scene is ready
  useEffect(() => {
    if (sceneReady) {
      animationFrameId.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [sceneReady, animate]);

  // Handle drone sound toggle
  useEffect(() => {
    if (!isDroneSound) {
      stopDrone();
    }
  }, [isDroneSound, stopDrone]);

  // Handle drone toggle button
  const handleDroneToggle = async () => {
    await startAudioContext();
    setDroneSound(!isDroneSound);
  };

  // Clear error
  const handleDismissError = () => {
    setError(null);
  };

  return (
    <div className="relative w-full h-[400px] lg:h-full rounded-lg bg-gray-900 border border-gray-800 p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Visualizer Sandbox</h2>
        <button
          onClick={handleDroneToggle}
          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md hover:bg-gray-800/50 transition-colors"
        >
          <MusicNoteIcon className="w-4 h-4" />
          Drone Sound
          {isDroneSound ? (
            <VolumeUpIcon className="w-4 h-4 text-green-400" />
          ) : (
            <VolumeOffIcon className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      <div className="absolute top-14 left-2 sm:left-6 text-[0.65rem] sm:text-xs font-mono z-10 p-1.5 sm:p-2 bg-black/40 rounded max-w-[180px] sm:max-w-none mobile-controls-compact">
        <p className={handDisplay.left.detected ? 'text-blue-400' : 'text-gray-500'}>
          LEFT ({handDisplay.left.detected ? 'ACTIVE' : 'OFF'})
        </p>
        <p>Scale: {handDisplay.left.scale.toFixed(2)}x</p>
        <div className="flex items-center gap-1">
          <span>Color: {Math.round(handDisplay.left.colorHue)}°</span>
          <span
            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
            style={{ backgroundColor: `hsl(${handDisplay.left.colorHue}, 100%, 50%)` }}
          ></span>
        </div>
        <p className="hidden sm:block">Hand Orientation: 3D Rotation</p>
        <br className="hidden sm:block" />
        <p className={handDisplay.right.detected ? 'text-green-400' : 'text-gray-500'}>
          RIGHT ({handDisplay.right.detected ? 'ACTIVE' : 'OFF'})
        </p>
        <p>
          {handDisplay.right.liftedFingers} Fingers = {handDisplay.right.liftedFingers} copies
        </p>
        <p className="hidden sm:block">Each copy is 1.25x larger</p>
      </div>

      <div className="absolute top-14 right-2 sm:right-6 text-[0.65rem] sm:text-xs z-10 p-1.5 sm:p-2 bg-black/40 rounded mobile-controls-compact">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-400"></span>
          <span className="hidden sm:inline">Left Hand: Color, Scale & Rotation</span>
          <span className="sm:hidden">Left</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 mt-1">
          <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400"></span>
          <span className="hidden sm:inline">Right Hand: Duplicate Shapes</span>
          <span className="sm:hidden">Right</span>
        </div>
      </div>

      <canvas ref={canvasRef} className="w-full h-full rounded-md" />
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-32 h-24 sm:w-48 sm:h-36 rounded-md shadow-lg border-2 border-gray-700 object-cover mobile-video-small"
        style={{ transform: 'scaleX(-1)' }}
      />

      {!isReady && (
        <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
          <p>Loading 3D Synth...</p>
        </div>
      )}

      {handTrackingError && (
        <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center text-center p-4">
          <p className="text-red-400">{handTrackingError}</p>
        </div>
      )}

      <ErrorAlert error={error} onDismiss={handleDismissError} />
    </div>
  );
};

export default Visualizer;
