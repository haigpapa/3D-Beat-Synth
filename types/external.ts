// TypeScript type definitions for external libraries loaded from CDN

// Tone.js types
export interface ToneEnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface ToneOscillator {
  type: 'sine' | 'square' | 'sawtooth' | 'triangle';
}

export interface AMSynthOptions {
  harmonicity: number;
  oscillator: ToneOscillator;
  envelope: ToneEnvelope;
  modulation: ToneOscillator;
  modulationEnvelope: Partial<ToneEnvelope>;
}

export interface ToneSynth {
  toDestination(): ToneSynth;
  triggerAttack(note: string): void;
  triggerRelease(): void;
  triggerAttackRelease(notes: string | string[], duration: string): void;
  volume: { value: number };
  frequency: { value: number };
  harmonicity: { value: number };
  state: 'started' | 'stopped';
}

export interface ToneContext {
  state: 'running' | 'suspended' | 'closed';
}

export interface ToneStatic {
  AMSynth: new (options: Partial<AMSynthOptions>) => ToneSynth;
  PolySynth: new (synth: typeof ToneStatic.MembraneSynth) => ToneSynth;
  MembraneSynth: any;
  context: ToneContext;
  start(): Promise<void>;
}

// MediaPipe types
export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface Handedness {
  categoryName: 'Left' | 'Right';
  score: number;
}

export interface HandLandmarkerResult {
  landmarks: Landmark[][];
  handednesses: Handedness[][];
}

export interface HandLandmarker {
  detectForVideo(video: HTMLVideoElement, timestamp: number): HandLandmarkerResult;
}

export interface FilesetResolver {
  forVisionTasks(wasmPath: string): Promise<FilesetResolver>;
}

export interface HandLandmarkerOptions {
  baseOptions: {
    modelAssetPath: string;
    delegate: 'GPU' | 'CPU';
  };
  runningMode: 'VIDEO' | 'IMAGE';
  numHands: number;
}

export interface VisionStatic {
  FilesetResolver: {
    forVisionTasks(wasmPath: string): Promise<FilesetResolver>;
  };
  HandLandmarker: {
    createFromOptions(
      resolver: FilesetResolver,
      options: HandLandmarkerOptions
    ): Promise<HandLandmarker>;
  };
}

// Global declarations
declare global {
  interface Window {
    Tone: ToneStatic;
    vision: VisionStatic;
  }
}

export {};
