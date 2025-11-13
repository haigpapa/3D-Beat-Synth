import React from 'react';
import Slider from './ui/Slider';
import ToggleSwitch from './ui/ToggleSwitch';
import Dropdown from './ui/Dropdown';
import { VolumeUpIcon, MusicNoteIcon } from './icons';
import { AppSettings } from '../hooks/useSettings';
import { MUSIC_SCALES } from '../utils/musicScales';

interface AudioControlsProps {
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({ settings, onUpdateSetting }) => {
  const scaleOptions = Object.entries(MUSIC_SCALES).map(([key, value]) => ({
    value: key,
    label: value.name,
  }));

  const instrumentOptions = [
    { value: 'membrane', label: 'Membrane (Default)' },
    { value: 'piano', label: 'Piano' },
    { value: 'bells', label: 'Bells' },
    { value: 'strings', label: 'Strings' },
    { value: 'bass', label: 'Bass' },
    { value: 'synthLead', label: 'Synth Lead' },
  ];

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
        <MusicNoteIcon className="w-5 h-5" />
        Audio Controls
      </h3>

      <div className="flex flex-col gap-4">
        {/* Volume Controls */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400 flex items-center gap-1">
            <VolumeUpIcon className="w-4 h-4" />
            Volume
          </h4>
          <Slider
            label="Master"
            value={settings.masterVolume}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => onUpdateSetting('masterVolume', v)}
            unit="%"
          />
          <Slider
            label="Drone"
            value={settings.droneVolume}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => onUpdateSetting('droneVolume', v)}
            unit="%"
          />
          <Slider
            label="Notes"
            value={settings.notesVolume}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => onUpdateSetting('notesVolume', v)}
            unit="%"
          />
        </div>

        {/* Musical Settings */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400">Musical Settings</h4>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Scale</label>
            <Dropdown
              value={settings.musicScale}
              options={scaleOptions}
              onChange={(v) => onUpdateSetting('musicScale', v as any)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {MUSIC_SCALES[settings.musicScale].description}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Instrument</label>
            <Dropdown
              value={settings.instrumentPreset}
              options={instrumentOptions}
              onChange={(v) => onUpdateSetting('instrumentPreset', v as any)}
              className="w-full"
            />
          </div>
        </div>

        {/* Effects */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400">Effects</h4>

          <div>
            <ToggleSwitch
              label="Reverb"
              enabled={settings.enableReverb}
              onChange={(v) => onUpdateSetting('enableReverb', v)}
              description="Add spacious reverb effect"
            />
            {settings.enableReverb && (
              <div className="mt-2 ml-4">
                <Slider
                  label="Room Size"
                  value={settings.reverbSize}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => onUpdateSetting('reverbSize', v)}
                />
              </div>
            )}
          </div>

          <div>
            <ToggleSwitch
              label="Delay"
              enabled={settings.enableDelay}
              onChange={(v) => onUpdateSetting('enableDelay', v)}
              description="Add echo/delay effect"
            />
            {settings.enableDelay && (
              <div className="mt-2 ml-4 space-y-2">
                <Slider
                  label="Time"
                  value={settings.delayTime}
                  min={0.1}
                  max={1}
                  step={0.05}
                  onChange={(v) => onUpdateSetting('delayTime', v)}
                  unit="s"
                />
                <Slider
                  label="Feedback"
                  value={settings.delayFeedback}
                  min={0}
                  max={0.9}
                  step={0.05}
                  onChange={(v) => onUpdateSetting('delayFeedback', v)}
                />
              </div>
            )}
          </div>

          <div>
            <ToggleSwitch
              label="Filter"
              enabled={settings.enableFilter}
              onChange={(v) => onUpdateSetting('enableFilter', v)}
              description="Low-pass filter effect"
            />
            {settings.enableFilter && (
              <div className="mt-2 ml-4">
                <Slider
                  label="Cutoff"
                  value={settings.filterCutoff}
                  min={200}
                  max={8000}
                  step={100}
                  onChange={(v) => onUpdateSetting('filterCutoff', v)}
                  unit="Hz"
                />
              </div>
            )}
          </div>
        </div>

        {/* Advanced Features */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400">Advanced</h4>

          <div>
            <ToggleSwitch
              label="Arpeggiator"
              enabled={settings.enableArpeggiator}
              onChange={(v) => onUpdateSetting('enableArpeggiator', v)}
              description="Auto-play scale pattern"
            />
            {settings.enableArpeggiator && (
              <div className="mt-2 ml-4">
                <Slider
                  label="Speed"
                  value={settings.arpeggiatorSpeed}
                  min={1}
                  max={16}
                  step={1}
                  onChange={(v) => onUpdateSetting('arpeggiatorSpeed', v)}
                  unit=" notes/beat"
                />
              </div>
            )}
          </div>

          <ToggleSwitch
            label="Chord Mode"
            enabled={settings.chordMode}
            onChange={(v) => onUpdateSetting('chordMode', v)}
            description="Play chords instead of single notes"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioControls;
