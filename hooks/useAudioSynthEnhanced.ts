import { useRef, useCallback, useEffect, useState } from 'react';
import { ToneSynth, ToneStatic } from '../types/external';
import { InstrumentPreset, MusicScale } from './useSettings';
import { getScaleNotes, generateChord } from '../utils/musicScales';

interface UseAudioSynthEnhancedOptions {
  masterVolume?: number;
  droneVolume?: number;
  notesVolume?: number;
  musicScale?: MusicScale;
  instrumentPreset?: InstrumentPreset;
  enableReverb?: boolean;
  reverbSize?: number;
  enableDelay?: boolean;
  delayTime?: number;
  delayFeedback?: number;
  enableFilter?: boolean;
  filterCutoff?: number;
  enableArpeggiator?: boolean;
  arpeggiatorSpeed?: number;
  chordMode?: boolean;
  onError?: (error: Error) => void;
}

export const useAudioSynthEnhanced = (options: UseAudioSynthEnhancedOptions = {}) => {
  const droneRef = useRef<any>(null);
  const polySynthRef = useRef<any>(null);
  const reverbRef = useRef<any>(null);
  const delayRef = useRef<any>(null);
  const filterRef = useRef<any>(null);
  const masterVolumeRef = useRef<any>(null);
  const arpeggiatorIntervalRef = useRef<any>(null);

  const [isReady, setIsReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentScale, setCurrentScale] = useState<MusicScale>(options.musicScale || 'pentatonic');

  // Get instrument settings based on preset
  const getInstrumentSettings = useCallback((preset: InstrumentPreset) => {
    const Tone = window.Tone;
    if (!Tone) return null;

    const settings: Record<InstrumentPreset, any> = {
      piano: () => new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
      }),
      bells: () => new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 8,
        modulationIndex: 2,
        envelope: { attack: 0.001, decay: 2, sustain: 0.1, release: 2 },
      }),
      strings: () => new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.5, decay: 0.2, sustain: 0.8, release: 1.5 },
      }),
      bass: () => new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.2 },
      }),
      synthLead: () => new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 },
      }),
      membrane: () => new Tone.PolySynth(Tone.MembraneSynth),
    };

    return settings[preset]();
  }, []);

  // Initialize audio chain
  const initialize = useCallback(() => {
    try {
      const Tone: ToneStatic = window.Tone;
      if (!Tone) {
        throw new Error('Tone.js library not loaded');
      }

      // Create master volume
      const masterVolume = new Tone.Volume(0).toDestination();
      masterVolumeRef.current = masterVolume;

      // Create effects
      const reverb = new Tone.Reverb({
        decay: 2,
        wet: options.enableReverb ? (options.reverbSize || 0.5) : 0,
      });
      reverbRef.current = reverb;

      const delay = new Tone.FeedbackDelay({
        delayTime: options.delayTime || 0.25,
        feedback: options.delayFeedback || 0.3,
        wet: options.enableDelay ? 0.5 : 0,
      });
      delayRef.current = delay;

      const filter = new Tone.Filter({
        frequency: options.filterCutoff || 2000,
        type: 'lowpass',
        rolloff: -24,
      });
      filterRef.current = filter;

      // Create drone synth
      const drone = new Tone.AMSynth({
        harmonicity: 1.5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 },
        modulation: { type: 'square' },
        modulationEnvelope: { attack: 0.5, decay: 0.01 },
      });
      drone.volume.value = -20;

      // Create poly synth with current instrument
      const polySynth = getInstrumentSettings(options.instrumentPreset || 'membrane');
      if (polySynth) {
        polySynth.volume.value = -10;
      }

      // Connect audio chain: synth -> filter -> delay -> reverb -> master -> destination
      if (options.enableFilter) {
        drone.connect(filter);
        if (polySynth) polySynth.connect(filter);
        filter.connect(delay);
      } else {
        drone.connect(delay);
        if (polySynth) polySynth.connect(delay);
      }

      delay.connect(reverb);
      reverb.connect(masterVolume);

      droneRef.current = drone;
      polySynthRef.current = polySynth;
      setIsReady(true);
    } catch (e) {
      console.error('Failed to initialize audio synthesis', e);
      if (options.onError) {
        options.onError(new Error('Failed to initialize audio. Please refresh the page.'));
      }
    }
  }, [options, getInstrumentSettings]);

  // Update volumes
  useEffect(() => {
    if (!isReady) return;

    if (masterVolumeRef.current && options.masterVolume !== undefined) {
      const dbValue = (options.masterVolume - 1) * 40; // Convert 0-1 to -40 to 0 dB
      masterVolumeRef.current.volume.value = dbValue;
    }

    if (droneRef.current && options.droneVolume !== undefined) {
      const dbValue = (options.droneVolume - 1) * 40;
      droneRef.current.volume.value = dbValue - 20;
    }

    if (polySynthRef.current && options.notesVolume !== undefined) {
      const dbValue = (options.notesVolume - 1) * 40;
      polySynthRef.current.volume.value = dbValue - 10;
    }
  }, [isReady, options.masterVolume, options.droneVolume, options.notesVolume]);

  // Update effects
  useEffect(() => {
    if (!isReady) return;

    if (reverbRef.current) {
      reverbRef.current.wet.value = options.enableReverb ? (options.reverbSize || 0.5) : 0;
      reverbRef.current.decay = (options.reverbSize || 0.5) * 4;
    }

    if (delayRef.current) {
      delayRef.current.wet.value = options.enableDelay ? 0.5 : 0;
      delayRef.current.delayTime.value = options.delayTime || 0.25;
      delayRef.current.feedback.value = options.delayFeedback || 0.3;
    }

    if (filterRef.current && options.filterCutoff) {
      filterRef.current.frequency.value = options.filterCutoff;
    }
  }, [
    isReady,
    options.enableReverb,
    options.reverbSize,
    options.enableDelay,
    options.delayTime,
    options.delayFeedback,
    options.filterCutoff,
  ]);

  // Update scale
  useEffect(() => {
    if (options.musicScale) {
      setCurrentScale(options.musicScale);
    }
  }, [options.musicScale]);

  // Start audio context
  const startAudioContext = useCallback(async () => {
    try {
      const Tone: ToneStatic = window.Tone;
      if (Tone && Tone.context.state !== 'running') {
        await Tone.start();
        setIsInitialized(true);
      }
    } catch (e) {
      console.error('Failed to start audio context', e);
      if (options.onError) {
        options.onError(new Error('Failed to start audio. Please try again.'));
      }
    }
  }, [options]);

  // Start drone
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

  // Stop drone
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

  // Update drone
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

  // Play notes (with chord mode support)
  const playNotes = useCallback(async (notes: string | string[], duration = '8n') => {
    if (!polySynthRef.current) return;

    await startAudioContext();

    try {
      let notesToPlay = Array.isArray(notes) ? notes : [notes];

      // Apply chord mode
      if (options.chordMode && notesToPlay.length === 1) {
        notesToPlay = generateChord(notesToPlay[0], 'major');
      }

      polySynthRef.current.triggerAttackRelease(notesToPlay, duration);
    } catch (e) {
      console.error('Failed to play notes', e);
    }
  }, [startAudioContext, options.chordMode]);

  // Start arpeggiator
  const startArpeggiator = useCallback(() => {
    if (!options.enableArpeggiator || !polySynthRef.current) return;

    stopArpeggiator();

    const notes = getScaleNotes(currentScale);
    let index = 0;
    const speed = options.arpeggiatorSpeed || 8;
    const interval = (1000 * 60) / (speed * 60); // Convert speed to ms

    arpeggiatorIntervalRef.current = setInterval(() => {
      const note = notes[index % notes.length];
      playNotes(note, '16n');
      index++;
    }, interval);
  }, [options.enableArpeggiator, options.arpeggiatorSpeed, currentScale, playNotes]);

  // Stop arpeggiator
  const stopArpeggiator = useCallback(() => {
    if (arpeggiatorIntervalRef.current) {
      clearInterval(arpeggiatorIntervalRef.current);
      arpeggiatorIntervalRef.current = null;
    }
  }, []);

  // Manage arpeggiator state
  useEffect(() => {
    if (options.enableArpeggiator) {
      startArpeggiator();
    } else {
      stopArpeggiator();
    }

    return () => stopArpeggiator();
  }, [options.enableArpeggiator, startArpeggiator, stopArpeggiator]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopArpeggiator();
      stopDrone();
    };
  }, [stopArpeggiator, stopDrone]);

  return {
    isReady,
    isInitialized,
    startDrone,
    stopDrone,
    updateDrone,
    playNotes,
    startAudioContext,
    startArpeggiator,
    stopArpeggiator,
    currentScale,
  };
};
