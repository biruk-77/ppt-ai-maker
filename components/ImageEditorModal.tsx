import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface ImageEditorModalProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (editPrompt: string) => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ imageUrl, onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');

  const handleSave = () => {
    if (prompt.trim()) {
      onSave(prompt);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full bg-gray-700 hover:bg-gray-600 transition">
          <XMarkIcon className="w-5 h-5 text-white" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-4">Edit Image</h2>
        
        <img src={imageUrl} alt="Image to edit" className="w-full aspect-video rounded-lg object-cover mb-4" />
        
        <div className="flex gap-2">
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Make it look like a watercolor painting"
                className="flex-grow w-full bg-gray-700/50 border border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200"
                aria-label="Image edit prompt"
            />
            <button
                onClick={handleSave}
                disabled={!prompt.trim()}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-indigo-500 disabled:opacity-50 transition duration-200 active:active-press"
            >
                <SparklesIcon className="w-5 h-5" />
                <span>Apply</span>
            </button>
        </div>
      </div>
    </div>
  );
};
