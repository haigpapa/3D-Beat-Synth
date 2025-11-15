import React from 'react';

interface PWAInstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onInstall, onDismiss }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gradient-to-r from-orange-600 to-orange-500 text-white p-4 rounded-lg shadow-2xl z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-2xl">📱</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Install 3D Beat Synth</h3>
          <p className="text-sm text-orange-100 mb-3">
            Add to your home screen for quick access and offline use!
          </p>
          <div className="flex gap-2">
            <button
              onClick={onInstall}
              className="flex-1 bg-white text-orange-600 font-semibold px-4 py-2 rounded hover:bg-orange-50 transition-colors"
            >
              Install
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-orange-100 hover:text-white transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
