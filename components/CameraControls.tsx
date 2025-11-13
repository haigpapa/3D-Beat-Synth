import React, { useState, useEffect } from 'react';
import { CameraIcon } from './icons';

interface CameraControlsProps {
  onCameraChange: (deviceId: string) => void;
}

const CameraControls: React.FC<CameraControlsProps> = ({ onCameraChange }) => {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  useEffect(() => {
    const getCameras = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error enumerating cameras:', err);
      }
    };

    getCameras();
  }, []);

  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value;
    setSelectedCamera(deviceId);
    onCameraChange(deviceId);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
        <CameraIcon className="w-5 h-5" />
        Camera
      </h3>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label htmlFor="camera-select" className="text-sm text-gray-400">
            Select Camera
          </label>
          <select
            id="camera-select"
            value={selectedCamera}
            onChange={handleCameraChange}
            className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm"
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default CameraControls;
