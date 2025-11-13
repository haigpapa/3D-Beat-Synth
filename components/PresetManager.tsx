import React, { useState } from 'react';
import Button from './ui/Button';
import { AppSettings } from '../hooks/useSettings';

interface PresetManagerProps {
  settings: AppSettings;
  onImport: (json: string) => boolean;
  onExport: () => string;
  onReset: () => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({
  settings,
  onImport,
  onExport,
  onReset,
}) => {
  const [showExport, setShowExport] = useState(false);

  const handleExport = () => {
    const json = onExport();
    setShowExport(true);
    navigator.clipboard.writeText(json);
  };

  const handleImport = () => {
    const json = prompt('Paste your preset JSON:');
    if (json) {
      const success = onImport(json);
      if (success) {
        alert('Preset imported successfully!');
      } else {
        alert('Failed to import preset. Please check the JSON format.');
      }
    }
  };

  const handleDownload = () => {
    const json = onExport();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '3d-beat-synth-preset.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h3 className="text-base font-semibold mb-3">Presets</h3>

      <div className="flex flex-col gap-2">
        <Button onClick={handleExport} className="w-full">
          Copy Preset to Clipboard
        </Button>

        <Button onClick={handleDownload} className="w-full">
          Download Preset
        </Button>

        <Button onClick={handleImport} className="w-full">
          Import Preset
        </Button>

        <Button
          onClick={() => {
            if (confirm('Reset all settings to defaults?')) {
              onReset();
            }
          }}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          Reset to Defaults
        </Button>
      </div>

      {showExport && (
        <div className="mt-3 p-2 bg-green-900/30 border border-green-500 rounded text-sm">
          ✓ Preset copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default PresetManager;
