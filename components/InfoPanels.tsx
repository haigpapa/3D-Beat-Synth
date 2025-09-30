
import React, { useState } from 'react';
import Accordion from './ui/Accordion';
import { MusicNoteIcon } from './icons';
import Button from './ui/Button';

const InfoPanels: React.FC = () => {
    const [handDataView, setHandDataView] = useState<'Left' | 'Right'>('Left');

    return (
        <div className="space-y-4">
            <Accordion
                title={
                    <div className="flex items-center gap-2">
                        <MusicNoteIcon className="w-5 h-5"/>
                        <span className="font-semibold">Scale Information</span>
                    </div>
                }
            >
                <p className="text-sm text-gray-400">
                    This section would provide information about musical scales, chords, and how they map to the synth engine. For example, it could show the current key and available notes for improvisation.
                </p>
            </Accordion>
            
            <Accordion
                title={
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Hand Data</span>
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-800/50 text-red-300 rounded-full border border-red-700/50">
                                No Hand Detected
                            </span>
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
                    <p className="text-sm text-gray-400">
                        This panel would display detailed raw data from the hand tracking model, such as landmark coordinates and gesture classification confidence scores. This would be useful for debugging and fine-tuning the interaction.
                    </p>
                    <p className="text-sm text-gray-400">
                        Currently showing data for: <strong>{handDataView} Hand</strong>
                    </p>
                </div>
            </Accordion>
        </div>
    );
};

export default InfoPanels;
