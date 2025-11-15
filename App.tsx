
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import AudioControls from './components/AudioControls';
import PresetManager from './components/PresetManager';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import InfoPanels from './components/InfoPanels';
import ErrorBoundary from './components/ErrorBoundary';
import { KeyboardShortcutsHelp } from './hooks/useKeyboardShortcuts';
import { ShapeType, HandData, PerformanceConfig } from './types';
import { useSettings } from './hooks/useSettings';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useFullscreen } from './hooks/useFullscreen';
import { usePWA, registerServiceWorker } from './hooks/usePWA';

const App: React.FC = () => {
  const {
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    isLoaded,
  } = useSettings();

  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { isInstallable, isInstalled, isOnline, installApp, dismissInstallPrompt } = usePWA();

  const [handData, setHandData] = useState<HandData>({
    left: { detected: false, scale: 0.5, colorHue: 38, rotation: { x: 0, y: 0, z: 0 } },
    right: { detected: false, liftedFingers: 0 },
  });
  const [texture, setTexture] = useState<string | null>(null);

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Performance configuration
  const performanceConfig: PerformanceConfig = useMemo(() => ({
    enabled: settings.isPerformanceMode,
    geometryDetail: settings.isPerformanceMode ? 'low' : 'high',
    maxShapes: settings.isPerformanceMode ? 5 : 10,
    targetFrameRate: settings.isPerformanceMode ? 30 : 60,
    enablePostProcessing: !settings.isPerformanceMode,
  }), [settings.isPerformanceMode]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    enabled: isLoaded,
    settings,
    onUpdateSetting: updateSetting,
    onToggleFullscreen: toggleFullscreen,
  });

  const handleTextureUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setTexture(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSampleTexture = useCallback((textureName: 'grid' | 'fingerprint') => {
    if (textureName === 'grid') {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#fb923c';
        ctx.lineWidth = 2;
        for (let i = 0; i < 256; i += 16) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 256);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(256, i);
          ctx.stroke();
        }
      }
      setTexture(canvas.toDataURL());
    } else {
      // fingerprint
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1;
        let x = 128,
          y = 128,
          radius = 2;
        for (let i = 0; i < 15; i++) {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.stroke();
          radius += 8;
        }
      }
      setTexture(canvas.toDataURL());
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-950 font-sans p-4 sm:p-6 lg:p-8 flex flex-col gap-6 dark">
        <Header
          shape={settings.shape}
          onShapeChange={(shape) => updateSetting('shape', shape)}
          isPerformanceMode={settings.isPerformanceMode}
          onPerformanceModeChange={(mode) => updateSetting('isPerformanceMode', mode)}
        />
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2">
            <Visualizer
              isHandTracking={settings.isHandTracking}
              isWireframe={settings.isWireframe}
              textureUrl={texture}
              shapeType={settings.shape}
              isDroneSound={settings.isDroneSound}
              setDroneSound={(enabled) => updateSetting('isDroneSound', enabled)}
              performanceConfig={performanceConfig}
              onHandDataUpdate={setHandData}
              deviceId={settings.deviceId}
            />
          </div>
          <div className="flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
            <Controls
              isHandTracking={settings.isHandTracking}
              onHandTrackingChange={(enabled) => updateSetting('isHandTracking', enabled)}
              isWireframe={settings.isWireframe}
              onWireframeChange={(enabled) => updateSetting('isWireframe', enabled)}
              onTextureUpload={handleTextureUpload}
              onSampleTextureSelect={handleSampleTexture}
              onCameraChange={(deviceId) => updateSetting('deviceId', deviceId)}
            />
            <AudioControls
              settings={settings}
              onUpdateSetting={updateSetting}
            />
            <PresetManager
              settings={settings}
              onExport={exportSettings}
              onImport={importSettings}
              onReset={resetSettings}
            />
            <InfoPanels handData={handData} />
          </div>
        </main>

        {/* Keyboard shortcuts help */}
        {settings.showKeyboardShortcuts && (
          <KeyboardShortcutsHelp
            onClose={() => updateSetting('showKeyboardShortcuts', false)}
          />
        )}

        {/* Fullscreen indicator */}
        {isFullscreen && (
          <div className="fixed top-4 right-4 bg-black/80 px-4 py-2 rounded text-sm text-white z-40">
            Press ESC or F to exit fullscreen
          </div>
        )}

        {/* PWA Install Prompt */}
        {isInstallable && !isInstalled && (
          <PWAInstallPrompt
            onInstall={installApp}
            onDismiss={dismissInstallPrompt}
          />
        )}

        {/* Offline Indicator */}
        {!isOnline && (
          <div className="fixed top-4 left-4 bg-yellow-600 text-white px-4 py-2 rounded text-sm z-40 flex items-center gap-2">
            <span>📡</span>
            <span>Offline Mode</span>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
