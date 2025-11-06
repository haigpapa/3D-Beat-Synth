
import React from 'react';
import { MusicNoteIcon, SphereIcon } from './icons';
import Button from './ui/Button';
import Dropdown from './ui/Dropdown';
import { ShapeType } from '../types';

interface HeaderProps {
  shape: ShapeType;
  onShapeChange: (shape: ShapeType) => void;
  isPerformanceMode: boolean;
  onPerformanceModeChange: (isPerformanceMode: boolean) => void;
}

const SHAPE_OPTIONS = [
  { value: 'Sphere', label: 'Sphere' },
  { value: 'Cube', label: 'Cube' },
  { value: 'Torus', label: 'Torus' },
  { value: 'Cone', label: 'Cone' },
  { value: 'Cylinder', label: 'Cylinder' },
  { value: 'Dodecahedron', label: 'Dodecahedron' },
  { value: 'Octahedron', label: 'Octahedron' },
  { value: 'Tetrahedron', label: 'Tetrahedron' },
];

const Header: React.FC<HeaderProps> = ({ shape, onShapeChange, isPerformanceMode, onPerformanceModeChange }) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter">
        3D Beat <span className="text-gray-400">Synth</span>
      </h1>
      <div className="flex flex-wrap items-center gap-4">
        <Dropdown
          options={SHAPE_OPTIONS}
          value={shape}
          onChange={(value) => onShapeChange(value as ShapeType)}
          icon={<SphereIcon className="w-5 h-5 text-gray-400" />}
        />
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
