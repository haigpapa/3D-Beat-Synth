import { MusicScale } from '../hooks/useSettings';

export interface ScaleDefinition {
  name: string;
  notes: string[];
  description: string;
}

export const MUSIC_SCALES: Record<MusicScale, ScaleDefinition> = {
  pentatonic: {
    name: 'Pentatonic',
    notes: ['C3', 'E3', 'G3', 'B3', 'D4'],
    description: 'Classic 5-note scale, harmonious and versatile',
  },
  major: {
    name: 'Major',
    notes: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'],
    description: 'Bright and happy sounding scale',
  },
  minor: {
    name: 'Minor',
    notes: ['C3', 'D3', 'Eb3', 'F3', 'G3', 'Ab3', 'Bb3', 'C4'],
    description: 'Melancholic and emotional scale',
  },
  blues: {
    name: 'Blues',
    notes: ['C3', 'Eb3', 'F3', 'Gb3', 'G3', 'Bb3', 'C4'],
    description: 'Soulful blues scale with flat notes',
  },
  chromatic: {
    name: 'Chromatic',
    notes: ['C3', 'Db3', 'D3', 'Eb3', 'E3', 'F3', 'Gb3', 'G3', 'Ab3', 'A3', 'Bb3', 'B3'],
    description: 'All 12 semitones, maximum variety',
  },
  hirajoshi: {
    name: 'Hirajoshi',
    notes: ['C3', 'D3', 'Eb3', 'G3', 'Ab3', 'C4'],
    description: 'Traditional Japanese scale, exotic and mysterious',
  },
  arabic: {
    name: 'Arabic',
    notes: ['C3', 'Db3', 'E3', 'F3', 'G3', 'Ab3', 'B3', 'C4'],
    description: 'Middle Eastern scale with augmented seconds',
  },
  wholeTone: {
    name: 'Whole Tone',
    notes: ['C3', 'D3', 'E3', 'Gb3', 'Ab3', 'Bb3', 'C4'],
    description: 'Dreamy and ethereal, all whole steps',
  },
};

// Get notes for a specific scale
export const getScaleNotes = (scale: MusicScale): string[] => {
  return MUSIC_SCALES[scale].notes;
};

// Get scale info
export const getScaleInfo = (scale: MusicScale): ScaleDefinition => {
  return MUSIC_SCALES[scale];
};

// Chord generator - returns array of notes for a chord
export const generateChord = (rootNote: string, type: 'major' | 'minor' | 'seventh' = 'major'): string[] => {
  const noteMap: Record<string, number> = {
    'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5,
    'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11
  };

  const match = rootNote.match(/([A-G]b?)(\d+)/);
  if (!match) return [rootNote];

  const [, note, octave] = match;
  const baseIndex = noteMap[note];
  const oct = parseInt(octave);

  const intervals = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    seventh: [0, 4, 7, 10],
  };

  const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  return intervals[type].map(interval => {
    const noteIndex = (baseIndex + interval) % 12;
    const octaveOffset = Math.floor((baseIndex + interval) / 12);
    return `${notes[noteIndex]}${oct + octaveOffset}`;
  });
};
