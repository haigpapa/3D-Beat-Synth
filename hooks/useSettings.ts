import { useState, useEffect, useCallback } from 'react';
import { ShapeType } from '../types';

export type MusicScale = 'pentatonic' | 'major' | 'minor' | 'blues' | 'chromatic' | 'hirajoshi' | 'arabic' | 'wholeTone';
export type InstrumentPreset = 'piano' | 'bells' | 'strings' | 'bass' | 'synthLead' | 'membrane';
export type BackgroundEffect = 'none' | 'gradient' | 'starfield' | 'grid';

export interface AppSettings {
  // Audio Settings
  masterVolume: number;
  droneVolume: number;
  notesVolume: number;
  musicScale: MusicScale;
  instrumentPreset: InstrumentPreset;
  enableReverb: boolean;
  reverbSize: number;
  enableDelay: boolean;
  delayTime: number;
  delayFeedback: number;
  enableFilter: boolean;
  filterCutoff: number;
  enableArpeggiator: boolean;
  arpeggiatorSpeed: number;
  chordMode: boolean;

  // Visual Settings
  shape: ShapeType;
  isWireframe: boolean;
  backgroundEffect: BackgroundEffect;
  rainbowMode: boolean;
  pulseMode: boolean;
  glowMode: boolean;
  enableParticles: boolean;
  enableShadows: boolean;
  cameraAutoRotate: boolean;

  // Interaction Settings
  isHandTracking: boolean;
  deviceId?: string;
  isDroneSound: boolean;
  isPerformanceMode: boolean;

  // Gesture Settings
  enableGesturePresets: boolean;

  // UI Settings
  tutorialCompleted: boolean;
  showKeyboardShortcuts: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  // Audio
  masterVolume: 0.7,
  droneVolume: 0.5,
  notesVolume: 0.8,
  musicScale: 'pentatonic',
  instrumentPreset: 'membrane',
  enableReverb: false,
  reverbSize: 0.5,
  enableDelay: false,
  delayTime: 0.25,
  delayFeedback: 0.3,
  enableFilter: false,
  filterCutoff: 2000,
  enableArpeggiator: false,
  arpeggiatorSpeed: 8,
  chordMode: false,

  // Visual
  shape: 'Sphere',
  isWireframe: true,
  backgroundEffect: 'none',
  rainbowMode: false,
  pulseMode: false,
  glowMode: false,
  enableParticles: false,
  enableShadows: false,
  cameraAutoRotate: false,

  // Interaction
  isHandTracking: true,
  isDroneSound: true,
  isPerformanceMode: false,

  // Gesture
  enableGesturePresets: true,

  // UI
  tutorialCompleted: false,
  showKeyboardShortcuts: true,
};

const STORAGE_KEY = '3d-beat-synth-settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings, isLoaded]);

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple settings at once
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Export settings as JSON
  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  // Import settings from JSON
  const importSettings = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json);
      setSettings({ ...DEFAULT_SETTINGS, ...imported });
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }, []);

  return {
    settings,
    updateSetting,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    isLoaded,
  };
};
