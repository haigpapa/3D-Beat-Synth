# 3D-Beat-Synth

> A somatic instrument that translates hand gestures into spatial audio and 3D geometry using only a webcam.

## 0. System Intent

This system democratizes spatial computing by removing hardware barriers. It proves that the body—tracked by a standard webcam—can become a direct interface for digital creation without VR headsets, controllers, or sensors.

It exists to collapse the distance between embodied thought and digital form.

## 1. Why This System Exists

**What failed before:**
- Spatial computing required expensive VR headsets ($500-$3500)
- Creative tools assumed mouse/keyboard as the only input paradigm
- Embodied interaction was locked behind proprietary hardware ecosystems
- Motion capture required specialized studios and equipment

**What tension shaped this design:**
The body already IS a sophisticated input device. We don't need to "teach" it new gestures—we need systems smart enough to read what it already does. Fourteen years of fronting Mashrou' Leila taught that the body knows things before language does. This system honors that somatic intelligence.

**What this explicitly does NOT do:**
- Compete with production-grade DAWs (Ableton, Logic)
- Provide photorealistic rendering or game-quality graphics
- Support multi-user collaboration or networked performance
- Function offline (requires MediaPipe CDN for hand tracking)
- Replace traditional instruments (it supplements them)

## 2. System Boundary

**Inputs:**
- Webcam feed (720p minimum recommended, 1080p optimal)
- Hand skeletal tracking (21 landmarks per hand via MediaPipe)
- Browser window dimensions and screen resolution

**Transformation:**
- Hand position (X, Y, Z) → 3D coordinates in Three.js scene
- Hand velocity and acceleration → Audio synthesis parameters (filter cutoff, resonance, amplitude)
- Gesture recognition (pinch, spread, rotation) → Trigger events (note on/off, effects, parameter modulation)
- Two-hand distance → Stereo width and spatial positioning

**Outputs:**
- Real-time spatial audio (Web Audio API stereo panning + reverb)
- Procedural 3D geometry responding to hand movement
- Visual feedback confirming gesture registration (hand skeleton overlay)
- Audio waveform visualization synchronized to synthesis

**External Dependencies:**
- MediaPipe Tasks Vision (Google CDN) - hand tracking model
- Tone.js - audio synthesis and effects
- React Three Fiber - declarative 3D rendering
- Three.js - WebGL 3D graphics engine

## 3. Architectural Approach

**Core Design Principles:**

1. **Zero Hardware Required**: Use only the device you already have (laptop + webcam). No external sensors, no special equipment.

2. **Reactive Physics-DSP Loop**: Audio and visuals poll the same state store independently. Visual rendering runs at display refresh rate (60fps), audio synthesis runs at audio sample rate (44.1kHz).

3. **Decoupled Rendering**: Audio engine runs at its own clock to prevent glitches during visual frame drops. If React re-renders stutter, sound continues uninterrupted.

**Chosen Abstractions:**

- **State Store Pattern**: Hand tracking writes to Zustand store; audio/visual systems read asynchronously. This prevents coupled failure—if rendering slows, audio stays smooth.

- **Gesture Vocabulary**: Predefined gestures (pinch distance, hand spread, rotation angle) mapped to musical parameters. Each gesture has a clear sonic affordance.

- **Spatial Audio Model**: Hand position in camera frame maps to stereo panning (X-axis) and reverb depth (Z-axis, distance from camera). This creates a performance space you can "walk through" with your hands.

**Trade-offs Accepted:**

- **Latency**: ~50-100ms input lag due to MediaPipe processing (acceptable for expressive performance, not acceptable for rhythm-critical tasks like drumming).

- **Browser-Only**: No native app for lower latency. Prioritized accessibility (works on any device with a browser) over performance optimization.

- **Lighting Dependency**: Hand tracking fails in low light (<200 lux). This is a MediaPipe limitation. Documented in failure modes below.

- **Single-User Only**: No networked collaboration. This is a solo performance instrument.

## 4. Choreography Layer

This system coordinates four dimensions:

**Attention:**
Visual feedback (3D geometry + hand skeleton overlay) confirms that the system "sees" you. This creates a feedback loop where the performer tunes their gesture to the system's response. Attention becomes a negotiation between human intent and machine recognition.

**Memory:**
Recent hand trajectories are stored briefly (200ms buffer) to enable "echo" effects and gestural recall. The system "remembers" your last movement and can mirror or respond to it. This creates a sense of call-and-response with yourself.

**Time:**
The system operates in "performance time" (60fps visual, 20ms audio buffer) rather than clock time. This creates a somatic NOW—a present tense where body and sound are synchronized. There is no timeline scrubbing, no undo. It's ephemeral by design.

**Interaction:**
The body is not "controlling" the instrument—it is conversing with it. The system proposes sound based on hand position; the performer responds by adjusting gesture. This is a dialogue, not a command interface.

## 5. Technical Stack (Justified)

| Technology | Why This Choice |
|------------|-----------------|
| **MediaPipe Tasks Vision** | Industry-standard hand tracking model. Runs entirely in browser without requiring server-side processing. Google maintains the model; we don't have to train or host it. 21-landmark skeletal data is rich enough for expressive gesture. |
| **Tone.js** | Web Audio API abstraction with built-in synthesis, effects, and transport. Handles audio timing independently of visual rendering. Prevents audio glitches when React re-renders. |
| **React Three Fiber** | Declarative 3D rendering that integrates cleanly with React state management. Allows us to treat 3D scene as React components rather than imperative Three.js API calls. |
| **Zustand + Immer** | Lightweight state management with immutable updates. Can handle 60fps hand tracking updates without Redux boilerplate. Immer makes state updates readable while keeping them performant. |
| **TypeScript** | Type safety is critical for complex 3D coordinate transformations and audio parameter mappings. Prevents runtime errors when mapping hand landmarks to synthesis parameters. |
| **Vite** | Fast development server with hot module replacement. Build times matter for creative iteration cycles. |

## 6. Artifacts

**Architecture Diagram:**
```
Webcam Feed
    ↓
MediaPipe Hand Tracking (21 landmarks/hand)
    ↓
Zustand State Store
    ├─→ Hand Position (X, Y, Z)
    ├─→ Hand Velocity
    ├─→ Recognized Gestures
    └─→ Gesture History (200ms buffer)
         ↓
    ┌────┴────┐
    ↓         ↓
Audio Engine  Visual Engine
(Tone.js)     (Three.js)
    ↓         ↓
Speakers      Canvas
```

**Key Code Excerpts:**

```typescript
// Decoupled State Pattern
// Audio polls state independently of React render cycle
useEffect(() => {
  const interval = setInterval(() => {
    const hands = handStore.getState().hands;
    if (hands.left) {
      // Map Y position (0-1) to frequency (100-800 Hz)
      synth.frequency.value = mapToFrequency(hands.left.position.y);

      // Map X position to stereo panning (-1 to 1)
      panner.pan.value = (hands.left.position.x * 2) - 1;
    }
  }, 20); // 50Hz update rate for smooth audio

  return () => clearInterval(interval);
}, []);
```

```typescript
// Gesture Recognition
// Pinch distance triggers note on/off
const pinchDistance = calculateDistance(
  landmarks[THUMB_TIP],
  landmarks[INDEX_FINGER_TIP]
);

if (pinchDistance < PINCH_THRESHOLD && !isPinching) {
  synth.triggerAttack();
  setIsPinching(true);
} else if (pinchDistance > PINCH_THRESHOLD && isPinching) {
  synth.triggerRelease();
  setIsPinching(false);
}
```

**Interface Definitions:**
```typescript
interface HandLandmark {
  x: number;  // Normalized 0-1 (left to right)
  y: number;  // Normalized 0-1 (top to bottom)
  z: number;  // Depth estimate (not calibrated)
}

interface GestureEvent {
  type: 'pinch' | 'spread' | 'rotate';
  confidence: number;
  hand: 'left' | 'right';
  timestamp: number;
}

interface AudioParams {
  frequency: number;      // Hz
  filterCutoff: number;   // Hz
  resonance: number;      // Q factor
  pan: number;           // -1 (left) to 1 (right)
  reverbMix: number;     // 0-1
}
```

## 7. Failure Modes & Limits

**What breaks:**
- **Low lighting** (<200 lux) → Hand tracking fails completely. MediaPipe requires visible hands. No infrared support.
- **CPU-bound devices** (<4 cores, <2GHz) → Frame drops cause visual stuttering. Audio continues but visual feedback lags.
- **Multiple hands in frame** → MediaPipe detects up to 2 hands but may confuse which hand belongs to the performer if others are visible.
- **Extreme hand positions** → Hands at edge of camera frame lose tracking accuracy. Keep hands in center 80% of frame.

**What scales poorly:**
- **Multiple performers**: Only one person at a time. No multi-user tracking.
- **Complex synthesis**: Adding many effects chains (>5 active effects) can cause audio glitches on slower devices.
- **Recording/streaming**: No built-in recording. Must use external screen capture if you want to save performances.

**What was consciously deferred:**
- **MIDI output**: Could export hand data as MIDI CC but didn't want to encourage use as "just another MIDI controller"
- **Preset system**: Performances should be ephemeral. No save/load functionality.
- **Mobile support**: MediaPipe works on mobile but performance is poor. Desktop-first design.
- **Accessibility**: No keyboard/mouse fallback. This is intentionally a somatic-only interface.

**What would require architectural changes:**
- **Low-latency mode** (<20ms): Would need native app with direct hardware access
- **Haptic feedback**: Would need external hardware (gloves, controllers)
- **Networked collaboration**: Would need server infrastructure for state synchronization

## 8. Background & Context

This system emerged from:
- **Mashrou' Leila (2008-2022)**: Using the body as sensor for political space. Live performance taught that gesture communicates before language does.
- **Architectural training (AUB, The Bartlett)**: Understanding how space coordinates human attention and movement.
- **Pandemic lockdown (2020)**: Building creative tools that work without access to studios, instruments, or collaborators.
- **Accessibility frustration**: Watching VR remain inaccessible to most of the world due to hardware costs.

It synthesizes:
- **Somatic intelligence**: The body's pre-linguistic knowing
- **Spatial audio design**: How sound creates a sense of place
- **Gesture as composition**: Movement as musical material
- **Zero-hardware ethos**: Access should not require privilege

**Current Status:**
- **Active Development** (2024–)
- Functional prototype deployed at [demo URL]
- Used in live performances and workshops
- Open to collaborators and testers

**Future Directions:**
- Integration with DERIVE for generative memory recall
- Connection to photon+ for visual-to-audio synthesis
- Workshop curriculum for teaching somatic interaction design

---

## Meaning Stack Navigator

This repository represents the **Sensorium Layer** of the **Meaning Stack**. Coordinate your navigation through the ecosystem here:

| Layer | System | Intent |
| :--- | :--- | :--- |
| **Sensorium** | [3D-Beat-Synth](https://github.com/haigpapa/3D-Beat-Synth) | Body as Input |
| **Latent Space** | [STORYLINES](https://github.com/haigpapa/STORYLINES) | Memory as Space |
| **Conductor** | [DERIVE](https://github.com/haigpapa/DERIVE) | Logic & Tuning |
| **Stage** | [photon+](https://github.com/haigpapa/photon) | Output & Performance |
| **Veracity Shield** | [hah-was](https://github.com/haigpapa/HAH-WAS) | Epistemic Defense |

**Operating System**: [ECHO (hmp00)](https://github.com/haigpapa/hmp00) | **Methodology**: [Choreography of Systems](https://github.com/haigpapa/choreography-of-systems)

---

**Maintained by:** [Haig Papazian](https://github.com/haigpapa) / [Walaw Studio](https://walaw.studio)
**Repository:** [github.com/haigpapa/3D-Beat-Synth](https://github.com/haigpapa/3D-Beat-Synth)
**License:** MIT (See LICENSE)
