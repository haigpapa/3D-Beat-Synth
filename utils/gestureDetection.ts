import { Landmark } from '../types/external';

export type GestureType = 'peace' | 'thumbsUp' | 'fist' | 'openPalm' | 'pointingUp' | 'none';

// Detect if thumb is extended
const isThumbExtended = (landmarks: Landmark[]): boolean => {
  const thumbTip = landmarks[4];
  const thumbBase = landmarks[2];
  return thumbTip.x > thumbBase.x + 0.05; // Thumb extended to the side
};

// Detect if index finger is extended
const isIndexExtended = (landmarks: Landmark[]): boolean => {
  const indexTip = landmarks[8];
  const indexBase = landmarks[6];
  return indexTip.y < indexBase.y - 0.05;
};

// Detect if middle finger is extended
const isMiddleExtended = (landmarks: Landmark[]): boolean => {
  const middleTip = landmarks[12];
  const middleBase = landmarks[10];
  return middleTip.y < middleBase.y - 0.05;
};

// Detect if ring finger is extended
const isRingExtended = (landmarks: Landmark[]): boolean => {
  const ringTip = landmarks[16];
  const ringBase = landmarks[14];
  return ringTip.y < ringBase.y - 0.05;
};

// Detect if pinky is extended
const isPinkyExtended = (landmarks: Landmark[]): boolean => {
  const pinkyTip = landmarks[20];
  const pinkyBase = landmarks[18];
  return pinkyTip.y < pinkyBase.y - 0.05;
};

// Detect peace sign (index and middle fingers up, others down)
export const detectPeaceSign = (landmarks: Landmark[]): boolean => {
  return (
    isIndexExtended(landmarks) &&
    isMiddleExtended(landmarks) &&
    !isRingExtended(landmarks) &&
    !isPinkyExtended(landmarks)
  );
};

// Detect thumbs up (only thumb extended)
export const detectThumbsUp = (landmarks: Landmark[]): boolean => {
  return (
    isThumbExtended(landmarks) &&
    !isIndexExtended(landmarks) &&
    !isMiddleExtended(landmarks) &&
    !isRingExtended(landmarks) &&
    !isPinkyExtended(landmarks)
  );
};

// Detect fist (all fingers closed)
export const detectFist = (landmarks: Landmark[]): boolean => {
  return (
    !isIndexExtended(landmarks) &&
    !isMiddleExtended(landmarks) &&
    !isRingExtended(landmarks) &&
    !isPinkyExtended(landmarks)
  );
};

// Detect open palm (all fingers extended)
export const detectOpenPalm = (landmarks: Landmark[]): boolean => {
  return (
    isIndexExtended(landmarks) &&
    isMiddleExtended(landmarks) &&
    isRingExtended(landmarks) &&
    isPinkyExtended(landmarks)
  );
};

// Detect pointing up (only index finger extended)
export const detectPointingUp = (landmarks: Landmark[]): boolean => {
  return (
    isIndexExtended(landmarks) &&
    !isMiddleExtended(landmarks) &&
    !isRingExtended(landmarks) &&
    !isPinkyExtended(landmarks)
  );
};

// Main gesture detection function
export const detectGesture = (landmarks: Landmark[]): GestureType => {
  if (detectPeaceSign(landmarks)) return 'peace';
  if (detectThumbsUp(landmarks)) return 'thumbsUp';
  if (detectPointingUp(landmarks)) return 'pointingUp';
  if (detectFist(landmarks)) return 'fist';
  if (detectOpenPalm(landmarks)) return 'openPalm';
  return 'none';
};

// Calculate hand distance from camera (using hand size as proxy)
export const calculateHandDistance = (landmarks: Landmark[]): number => {
  const wrist = landmarks[0];
  const middleTip = landmarks[12];

  const distance = Math.sqrt(
    Math.pow(wrist.x - middleTip.x, 2) +
    Math.pow(wrist.y - middleTip.y, 2) +
    Math.pow(wrist.z - middleTip.z, 2)
  );

  // Normalize to 0-1 range (closer = larger distance value)
  return Math.max(0, Math.min(1, distance * 3));
};

// Calculate hand velocity (requires previous position)
export const calculateHandVelocity = (
  currentLandmarks: Landmark[],
  previousLandmarks: Landmark[] | null
): number => {
  if (!previousLandmarks) return 0;

  const currentWrist = currentLandmarks[0];
  const previousWrist = previousLandmarks[0];

  const velocity = Math.sqrt(
    Math.pow(currentWrist.x - previousWrist.x, 2) +
    Math.pow(currentWrist.y - previousWrist.y, 2) +
    Math.pow(currentWrist.z - previousWrist.z, 2)
  );

  return velocity;
};

// Detect clap (both hands close together)
export const detectClap = (
  leftLandmarks: Landmark[] | undefined,
  rightLandmarks: Landmark[] | undefined
): boolean => {
  if (!leftLandmarks || !rightLandmarks) return false;

  const leftPalm = leftLandmarks[9]; // Middle of left palm
  const rightPalm = rightLandmarks[9]; // Middle of right palm

  const distance = Math.sqrt(
    Math.pow(leftPalm.x - rightPalm.x, 2) +
    Math.pow(leftPalm.y - rightPalm.y, 2) +
    Math.pow(leftPalm.z - rightPalm.z, 2)
  );

  // Clap detected if hands are very close
  return distance < 0.1;
};

// Calculate distance between two hands
export const calculateHandsDistance = (
  leftLandmarks: Landmark[] | undefined,
  rightLandmarks: Landmark[] | undefined
): number => {
  if (!leftLandmarks || !rightLandmarks) return 1;

  const leftPalm = leftLandmarks[9];
  const rightPalm = rightLandmarks[9];

  const distance = Math.sqrt(
    Math.pow(leftPalm.x - rightPalm.x, 2) +
    Math.pow(leftPalm.y - rightPalm.y, 2) +
    Math.pow(leftPalm.z - rightPalm.z, 2)
  );

  // Normalize to 0-1 range
  return Math.max(0, Math.min(1, distance));
};
