
import React from 'react';
import { MusicNoteIcon, SphereIcon } from './icons';
import Button from './ui/Button';
import { ShapeType } from '../types';

interface HeaderProps {
  shape: ShapeType;
  onShapeChange: (shape: ShapeType) => void;
  isPerformanceMode: boolean;
  onPerformanceModeChange: (isPerformanceMode: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ shape, onShapeChange, isPerformanceMode, onPerformanceModeChange }) => {
  // In a real app, this would be a dropdown. For simplicity, we'll just show the current shape.
  // A simple button could cycle through shapes if needed.
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter">
        3D Beat <span className="text-gray-400">Synth</span>
      </h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-gray-800/50 p-2 border border-gray-700">
          <SphereIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium">{shape}</span>
          {/* Dropdown would go here */}
        </div>
        <Button 
            variant={isPerformanceMode ? 'secondary' : 'primary'}
            onClick={() => onPerformanceModeChange(!isPerformanceMode)}
        >
          <MusicNoteIcon className="w-5 h-5 mr-2" />
          Performance Mode
        </Button>
      </div>
    </header>
  );
};

export default Header;
