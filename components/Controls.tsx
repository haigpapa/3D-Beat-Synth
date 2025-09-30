import React, { useRef } from 'react';
import ToggleSwitch from './ui/ToggleSwitch';
// FIX: Imported LeftHandIcon and RightHandIcon.
import { UploadIcon, GridIcon, FingerprintIcon, LeftHandIcon, RightHandIcon } from './icons';
import Button from './ui/Button';

interface ControlsProps {
  isHandTracking: boolean;
  onHandTrackingChange: (enabled: boolean) => void;
  isWireframe: boolean;
  onWireframeChange: (enabled: boolean) => void;
  onTextureUpload: (file: File) => void;
  onSampleTextureSelect: (texture: 'grid' | 'fingerprint') => void;
}

const Controls: React.FC<ControlsProps> = ({
  isHandTracking,
  onHandTrackingChange,
  isWireframe,
  onWireframeChange,
  onTextureUpload,
  onSampleTextureSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onTextureUpload(file);
    }
  };

  return (
    <div className="space-y-6 p-4 rounded-lg bg-gray-900 border border-gray-800">
      <div>
        <h2 className="text-lg font-semibold">Controls</h2>
        <p className="text-sm text-gray-400">Configure hand tracking settings.</p>
      </div>

      <div className="space-y-4">
        <SettingRow
          title="Hand Tracking"
          description="Enable or disable hand tracking"
        >
          <ToggleSwitch
            checked={isHandTracking}
            onChange={onHandTrackingChange}
            ariaLabel="Toggle hand tracking"
          />
        </SettingRow>
        <SettingRow
          title="Wireframe Mode"
          description="Toggle between wireframe and solid rendering"
        >
          <ToggleSwitch
            checked={isWireframe}
            onChange={onWireframeChange}
            ariaLabel="Toggle wireframe mode"
          />
        </SettingRow>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Upload Texture</h3>
        <div 
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800/50"
          onClick={handleUploadClick}
        >
          <UploadIcon className="w-8 h-8 text-gray-500 mb-2"/>
          <p className="text-sm font-semibold">Upload Texture</p>
          <p className="text-xs text-gray-500">JEPG, PNG, WebP</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
          />
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Sample Textures</h3>
        <div className="grid grid-cols-2 gap-2">
            <Button variant="primary" onClick={() => onSampleTextureSelect('grid')}>
                <GridIcon className="w-4 h-4 mr-2" />
                Grid Pattern
            </Button>
            <Button variant="primary" onClick={() => onSampleTextureSelect('fingerprint')}>
                <FingerprintIcon className="w-4 h-4 mr-2" />
                Fingerprint
            </Button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Interaction Guide</h3>
        <div className="p-3 rounded-lg bg-gray-800/50 space-y-3 text-sm">
            <div className="flex items-start gap-3">
                <LeftHandIcon className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                    <h4 className="font-bold text-blue-400">Left Hand Controls</h4>
                    <p className="text-gray-400">Controls shape properties (color, scale, rotation) and sound pitch/frequency.</p>
                </div>
            </div>
             <div className="flex items-start gap-3">
                <RightHandIcon className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                <div>
                    <h4 className="font-bold text-green-400">Right Hand Controls</h4>
                    <p className="text-gray-400">Controls duplication (one copy per lifted finger) and number of simultaneous sounds.</p>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

const SettingRow: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="flex items-center justify-between">
    <div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
    {children}
  </div>
);


export default Controls;