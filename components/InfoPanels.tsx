
import React, { useState } from 'react';
import Accordion from './ui/Accordion';
import { MusicNoteIcon } from './icons';
import Button from './ui/Button';
import { HandData } from '../types';

interface InfoPanelsProps {
  handData: HandData;
}

const InfoPanels: React.FC<InfoPanelsProps> = ({ handData }) => {
  const [handDataView, setHandDataView] = useState<'Left' | 'Right'>('Left');

  const isAnyHandDetected = handData.left.detected || handData.right.detected;
  const currentHandData = handDataView === 'Left' ? handData.left : handData.right;

  return (
    <div className="space-y-4">
      <Accordion
        title={
          <div className="flex items-center gap-2">
            <MusicNoteIcon className="w-5 h-5" />
            <span className="font-semibold">Scale Information</span>
          </div>
        }
      >
        <div className="text-sm text-gray-400 space-y-2">
          <p className="font-semibold text-white">Musical Scale Mapping</p>
          <p>
            The synth uses a pentatonic scale for melodic note generation:
          </p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><span className="text-blue-400">C3</span> - Root note (130.81 Hz)</li>
            <li><span className="text-blue-400">E3</span> - Major third (164.81 Hz)</li>
            <li><span className="text-blue-400">G3</span> - Perfect fifth (196.00 Hz)</li>
            <li><span className="text-blue-400">B3</span> - Major seventh (246.94 Hz)</li>
            <li><span className="text-blue-400">D4</span> - Major ninth (293.66 Hz)</li>
          </ul>
          <p className="mt-3">
            The drone frequency ranges from <span className="text-green-400">100Hz to 400Hz</span> based on shape scale (0.2x - 2.0x).
          </p>
          <p>
            Harmonicity modulation ranges from <span className="text-purple-400">1.0 to 3.0</span> based on color hue (0° - 360°).
          </p>
        </div>
      </Accordion>

      <Accordion
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Hand Data</span>
              {isAnyHandDetected ? (
                <span className="px-2 py-0.5 text-xs font-medium bg-green-800/50 text-green-300 rounded-full border border-green-700/50">
                  Hand Detected
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-800/50 text-red-300 rounded-full border border-red-700/50">
                  No Hand Detected
                </span>
              )}
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end">
            <div className="inline-flex rounded-md shadow-sm bg-gray-800 p-1">
              <Button
                variant={handDataView === 'Left' ? 'secondary' : 'primary'}
                onClick={() => setHandDataView('Left')}
                className="px-3 py-1 text-xs"
              >
                Left
              </Button>
              <Button
                variant={handDataView === 'Right' ? 'secondary' : 'primary'}
                onClick={() => setHandDataView('Right')}
                className="px-3 py-1 text-xs"
              >
                Right
              </Button>
            </div>
          </div>

          {currentHandData.detected ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-gray-800/50">
                <h4 className="font-semibold text-sm mb-2 text-white">
                  {handDataView} Hand Status
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400 ml-2">Active</span>
                  </div>
                  {currentHandData.confidence !== undefined && (
                    <div>
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-blue-400 ml-2">
                        {(currentHandData.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {handDataView === 'Left' && handData.left.detected && (
                <div className="p-3 rounded-lg bg-gray-800/50 space-y-2">
                  <h4 className="font-semibold text-sm text-white">Control Values</h4>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Scale:</span>
                      <span className="text-blue-400">{handData.left.scale.toFixed(3)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Color Hue:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400">{Math.round(handData.left.colorHue)}°</span>
                        <span
                          className="w-4 h-4 rounded-full border border-gray-600"
                          style={{ backgroundColor: `hsl(${handData.left.colorHue}, 100%, 50%)` }}
                        ></span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rotation X:</span>
                      <span className="text-yellow-400">{handData.left.rotation.x.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rotation Y:</span>
                      <span className="text-yellow-400">{handData.left.rotation.y.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rotation Z:</span>
                      <span className="text-yellow-400">{handData.left.rotation.z.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              )}

              {handDataView === 'Right' && handData.right.detected && (
                <div className="p-3 rounded-lg bg-gray-800/50 space-y-2">
                  <h4 className="font-semibold text-sm text-white">Control Values</h4>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Lifted Fingers:</span>
                      <span className="text-green-400">{handData.right.liftedFingers}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Raising more fingers creates {handData.right.liftedFingers} shape copies and plays{' '}
                      {handData.right.liftedFingers} simultaneous notes.
                    </div>
                  </div>
                </div>
              )}

              {currentHandData.landmarks && (
                <div className="p-3 rounded-lg bg-gray-800/50">
                  <h4 className="font-semibold text-sm mb-2 text-white">
                    Landmark Data ({currentHandData.landmarks.length} points)
                  </h4>
                  <div className="max-h-32 overflow-y-auto text-xs font-mono space-y-1">
                    {currentHandData.landmarks.slice(0, 5).map((landmark, index) => (
                      <div key={index} className="text-gray-400">
                        <span className="text-blue-400">L{index}:</span> x={landmark.x.toFixed(3)}, y=
                        {landmark.y.toFixed(3)}, z={landmark.z.toFixed(3)}
                      </div>
                    ))}
                    {currentHandData.landmarks.length > 5 && (
                      <div className="text-gray-500 text-center pt-1">
                        ... {currentHandData.landmarks.length - 5} more landmarks
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400 text-center py-4">
              <p>No {handDataView.toLowerCase()} hand detected</p>
              <p className="text-xs mt-2">
                Enable hand tracking and show your {handDataView.toLowerCase()} hand to the camera
              </p>
            </div>
          )}
        </div>
      </Accordion>
    </div>
  );
};

export default InfoPanels;
