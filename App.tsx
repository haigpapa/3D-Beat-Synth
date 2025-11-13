
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import InfoPanels from './components/InfoPanels';
import ErrorBoundary from './components/ErrorBoundary';
import { ShapeType, HandData, PerformanceConfig } from './types';

const App: React.FC = () => {
  const [shape, setShape] = useState<ShapeType>('Sphere');
  const [isPerformanceMode, setPerformanceMode] = useState(false);
  const [isHandTracking, setHandTracking] = useState(true);
  const [isWireframe, setWireframe] = useState(true);
  const [texture, setTexture] = useState<string | null>(null);
  const [isDroneSound, setDroneSound] = useState(true);
  const [handData, setHandData] = useState<HandData>({
    left: { detected: false, scale: 0.5, colorHue: 38, rotation: { x: 0, y: 0, z: 0 } },
    right: { detected: false, liftedFingers: 0 },
  });
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);

  // Performance configuration
  const performanceConfig: PerformanceConfig = {
    enabled: isPerformanceMode,
    geometryDetail: isPerformanceMode ? 'low' : 'high',
    maxShapes: isPerformanceMode ? 5 : 10,
    targetFrameRate: isPerformanceMode ? 30 : 60,
    enablePostProcessing: !isPerformanceMode,
  };

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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-950 font-sans p-4 sm:p-6 lg:p-8 flex flex-col gap-6 dark">
        <Header
          shape={shape}
          onShapeChange={setShape}
          isPerformanceMode={isPerformanceMode}
          onPerformanceModeChange={setPerformanceMode}
        />
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2">
            <Visualizer
              isHandTracking={isHandTracking}
              isWireframe={isWireframe}
              textureUrl={texture}
              shapeType={shape}
              isDroneSound={isDroneSound}
              setDroneSound={setDroneSound}
              performanceConfig={performanceConfig}
              onHandDataUpdate={setHandData}
              deviceId={deviceId}
            />
          </div>
          <div className="flex flex-col gap-6">
            <Controls
              isHandTracking={isHandTracking}
              onHandTrackingChange={setHandTracking}
              isWireframe={isWireframe}
              onWireframeChange={setWireframe}
              onTextureUpload={handleTextureUpload}
              onSampleTextureSelect={handleSampleTexture}
              onCameraChange={setDeviceId}
            />
            <InfoPanels handData={handData} />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
