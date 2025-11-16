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
  connect(destination: any): void;
}

export interface TonePolySynth {
  toDestination(): TonePolySynth;
  triggerAttackRelease(notes: string | string[], duration: string): void;
  volume: { value: number };
  connect(destination: any): void;
}

export interface ToneEffect {
  connect(destination: any): void;
  wet: { value: number };
}

export interface ToneVolume {
  toDestination(): ToneVolume;
  volume: { value: number };
}

export interface ToneReverb extends ToneEffect {
  decay: number;
}

export interface ToneFeedbackDelay extends ToneEffect {
  delayTime: { value: number };
  feedback: { value: number };
}

export interface ToneFilter extends ToneEffect {
  frequency: { value: number };
  type: string;
  rolloff: number;
}

export interface ToneContext {
  state: 'running' | 'suspended' | 'closed';
}

export interface SynthOptions {
  oscillator?: Partial<ToneOscillator>;
  envelope?: Partial<ToneEnvelope>;
}

export interface FMSynthOptions {
  harmonicity?: number;
  modulationIndex?: number;
  envelope?: Partial<ToneEnvelope>;
}

export interface ReverbOptions {
  decay?: number;
  wet?: number;
}

export interface DelayOptions {
  delayTime?: number;
  feedback?: number;
  wet?: number;
}

export interface FilterOptions {
  frequency?: number;
  type?: 'lowpass' | 'highpass' | 'bandpass';
  rolloff?: number;
}

export interface PolySynthConstructor {
  new (voiceType?: any, options?: any): TonePolySynth;
}

export interface ToneStatic {
  AMSynth: new (options?: Partial<AMSynthOptions>) => ToneSynth;
  Synth: new (options?: Partial<SynthOptions>) => ToneSynth;
  FMSynth: new (options?: Partial<FMSynthOptions>) => ToneSynth;
  MembraneSynth: new () => ToneSynth;
  PolySynth: PolySynthConstructor;
  Volume: new (volume: number) => ToneVolume;
  Reverb: new (options?: Partial<ReverbOptions>) => ToneReverb;
  FeedbackDelay: new (options?: Partial<DelayOptions>) => ToneFeedbackDelay;
  Filter: new (options?: Partial<FilterOptions>) => ToneFilter;
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
