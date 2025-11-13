import React, { useEffect, useCallback } from 'react';
import { ShapeType } from '../types';
import { AppSettings } from './useSettings';

interface KeyboardShortcutsOptions {
  enabled: boolean;
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onToggleFullscreen?: () => void;
  onTakeScreenshot?: () => void;
  onClearShapes?: () => void;
}

const SHAPE_KEYS: Record<string, ShapeType> = {
  '1': 'Sphere',
  '2': 'Cube',
  '3': 'Torus',
  '4': 'Cone',
  '5': 'Cylinder',
  '6': 'Dodecahedron',
  '7': 'Octahedron',
  '8': 'Tetrahedron',
};

export const useKeyboardShortcuts = ({
  enabled,
  settings,
  onUpdateSetting,
  onToggleFullscreen,
  onTakeScreenshot,
  onClearShapes,
}: KeyboardShortcutsOptions) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if user is typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = event.key.toLowerCase();

    switch (key) {
      // Toggle hand tracking
      case ' ':
      case 'h':
        event.preventDefault();
        onUpdateSetting('isHandTracking', !settings.isHandTracking);
        break;

      // Toggle wireframe
      case 'w':
        event.preventDefault();
        onUpdateSetting('isWireframe', !settings.isWireframe);
        break;

      // Toggle drone sound
      case 'd':
        event.preventDefault();
        onUpdateSetting('isDroneSound', !settings.isDroneSound);
        break;

      // Toggle performance mode
      case 'p':
        event.preventDefault();
        onUpdateSetting('isPerformanceMode', !settings.isPerformanceMode);
        break;

      // Toggle rainbow mode
      case 'r':
        event.preventDefault();
        onUpdateSetting('rainbowMode', !settings.rainbowMode);
        break;

      // Toggle particles
      case 't':
        event.preventDefault();
        onUpdateSetting('enableParticles', !settings.enableParticles);
        break;

      // Toggle pulse mode
      case 'u':
        event.preventDefault();
        onUpdateSetting('pulseMode', !settings.pulseMode);
        break;

      // Toggle glow mode
      case 'g':
        event.preventDefault();
        onUpdateSetting('glowMode', !settings.glowMode);
        break;

      // Toggle camera auto-rotate
      case 'a':
        event.preventDefault();
        onUpdateSetting('cameraAutoRotate', !settings.cameraAutoRotate);
        break;

      // Toggle reverb
      case 'v':
        event.preventDefault();
        onUpdateSetting('enableReverb', !settings.enableReverb);
        break;

      // Toggle chord mode
      case 'c':
        event.preventDefault();
        onUpdateSetting('chordMode', !settings.chordMode);
        break;

      // Fullscreen
      case 'f':
        event.preventDefault();
        if (onToggleFullscreen) onToggleFullscreen();
        break;

      // Screenshot
      case 's':
        if (event.shiftKey) {
          event.preventDefault();
          if (onTakeScreenshot) onTakeScreenshot();
        }
        break;

      // Clear shapes
      case 'x':
        event.preventDefault();
        if (onClearShapes) onClearShapes();
        break;

      // Shape selection (1-8)
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
        event.preventDefault();
        onUpdateSetting('shape', SHAPE_KEYS[key]);
        break;

      // Help - show keyboard shortcuts
      case '?':
        event.preventDefault();
        onUpdateSetting('showKeyboardShortcuts', !settings.showKeyboardShortcuts);
        break;
    }
  }, [enabled, settings, onUpdateSetting, onToggleFullscreen, onTakeScreenshot, onClearShapes]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};

// Component to display keyboard shortcuts
export const KeyboardShortcutsHelp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold text-orange-400 mb-2">General</h3>
            <ul className="space-y-1 text-sm">
              <li><kbd>Space</kbd> or <kbd>H</kbd> - Toggle hand tracking</li>
              <li><kbd>F</kbd> - Toggle fullscreen</li>
              <li><kbd>Shift+S</kbd> - Take screenshot</li>
              <li><kbd>X</kbd> - Clear all shapes</li>
              <li><kbd>?</kbd> - Toggle this help</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-orange-400 mb-2">Visual</h3>
            <ul className="space-y-1 text-sm">
              <li><kbd>W</kbd> - Toggle wireframe</li>
              <li><kbd>R</kbd> - Toggle rainbow mode</li>
              <li><kbd>U</kbd> - Toggle pulse mode</li>
              <li><kbd>G</kbd> - Toggle glow mode</li>
              <li><kbd>T</kbd> - Toggle particles</li>
              <li><kbd>A</kbd> - Toggle camera auto-rotate</li>
              <li><kbd>P</kbd> - Toggle performance mode</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-orange-400 mb-2">Audio</h3>
            <ul className="space-y-1 text-sm">
              <li><kbd>D</kbd> - Toggle drone sound</li>
              <li><kbd>V</kbd> - Toggle reverb</li>
              <li><kbd>C</kbd> - Toggle chord mode</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-orange-400 mb-2">Shapes</h3>
            <ul className="space-y-1 text-sm">
              <li><kbd>1</kbd> - Sphere</li>
              <li><kbd>2</kbd> - Cube</li>
              <li><kbd>3</kbd> - Torus</li>
              <li><kbd>4</kbd> - Cone</li>
              <li><kbd>5</kbd> - Cylinder</li>
              <li><kbd>6</kbd> - Dodecahedron</li>
              <li><kbd>7</kbd> - Octahedron</li>
              <li><kbd>8</kbd> - Tetrahedron</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-800/50 rounded">
          <p className="text-sm text-gray-400">
            <strong>Tip:</strong> You can use these shortcuts anytime to quickly control the synth!
          </p>
        </div>
      </div>
    </div>
  );
};
