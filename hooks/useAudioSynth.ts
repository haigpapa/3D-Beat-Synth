import { useRef, useCallback, useEffect, useState } from 'react';
import { ToneSynth, ToneStatic } from '../types/external';

interface UseAudioSynthOptions {
  onError?: (error: Error) => void;
}

export const useAudioSynth = ({ onError }: UseAudioSynthOptions = {}) => {
  const droneRef = useRef<ToneSynth | null>(null);
  const polySynthRef = useRef<ToneSynth | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Tone.js synthesizers
  const initialize = useCallback(() => {
    try {
      const Tone: ToneStatic = window.Tone;
      if (!Tone) {
        throw new Error('Tone.js library not loaded');
      }

      // Create AM Synth for drone sound
      const drone = new Tone.AMSynth({
        harmonicity: 1.5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.5, decay: 0.01 },
      }).toDestination();
      drone.volume.value = -20;

      // Create PolySynth for note triggers
      const polySynth = new Tone.PolySynth(Tone.MembraneSynth).toDestination();
      polySynth.volume.value = -10;

      droneRef.current = drone;
      polySynthRef.current = polySynth;
      setIsReady(true);
    } catch (e) {
      console.error('Failed to initialize audio synthesis', e);
      if (onError) {
        onError(new Error('Failed to initialize audio. Please refresh the page.'));
      }
    }
  }, [onError]);

  // Start audio context (requires user interaction)
  const startAudioContext = useCallback(async () => {
    try {
      const Tone: ToneStatic = window.Tone;
      if (Tone && Tone.context.state !== 'running') {
        await Tone.start();
        setIsInitialized(true);
      }
    } catch (e) {
      console.error('Failed to start audio context', e);
      if (onError) {
        onError(new Error('Failed to start audio. Please try again.'));
      }
    }
  }, [onError]);

  // Start drone sound
  const startDrone = useCallback(async (frequency = 100, harmonicity = 1.5) => {
    if (!droneRef.current) return;

    await startAudioContext();

    try {
      if (droneRef.current.state !== 'started') {
        droneRef.current.frequency.value = frequency;
        droneRef.current.harmonicity.value = harmonicity;
        droneRef.current.triggerAttack('C2');
      }
    } catch (e) {
      console.error('Failed to start drone', e);
    }
  }, [startAudioContext]);

  // Stop drone sound
  const stopDrone = useCallback(() => {
    if (!droneRef.current) return;

    try {
      if (droneRef.current.state === 'started') {
        droneRef.current.triggerRelease();
      }
    } catch (e) {
      console.error('Failed to stop drone', e);
    }
  }, []);

  // Update drone parameters
  const updateDrone = useCallback((frequency?: number, harmonicity?: number) => {
    if (!droneRef.current) return;

    try {
      if (frequency !== undefined) {
        droneRef.current.frequency.value = frequency;
      }
      if (harmonicity !== undefined) {
        droneRef.current.harmonicity.value = harmonicity;
      }
    } catch (e) {
      console.error('Failed to update drone parameters', e);
    }
  }, []);

  // Play notes
  const playNotes = useCallback(async (notes: string | string[], duration = '8n') => {
    if (!polySynthRef.current) return;

    await startAudioContext();

    try {
      polySynthRef.current.triggerAttackRelease(notes, duration);
    } catch (e) {
      console.error('Failed to play notes', e);
    }
  }, [startAudioContext]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    isReady,
    isInitialized,
    startDrone,
    stopDrone,
    updateDrone,
    playNotes,
    startAudioContext,
  };
};
