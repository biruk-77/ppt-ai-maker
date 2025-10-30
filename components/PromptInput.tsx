import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import type { GeneratePresentationParams } from '../services/geminiService';

interface PromptInputProps {
  onGenerate: (params: GeneratePresentationParams) => void;
  disabled: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, disabled }) => {
  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState<number>(30);
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ prompt, slideCount, useThinking, useSearch });
  };

  const handleSearchChange = (checked: boolean) => {
    setUseSearch(checked);
    if (checked) {
      setUseThinking(false); // Grounding and thinking mode are used in different scenarios
    }
  }

  const handleThinkingChange = (checked: boolean) => {
    setUseThinking(checked);
    if (checked) {
      setUseSearch(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., The History and Future of AI"
          disabled={disabled}
          className="flex-grow w-full bg-gray-700/50 border border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200"
          aria-label="Presentation Topic"
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
           <label htmlFor="slide-count" className="sr-only">Number of slides</label>
           <input
            id="slide-count"
            type="number"
            value={slideCount}
            onChange={(e) => setSlideCount(parseInt(e.target.value, 10))}
            min="1"
            max="30"
            disabled={disabled}
            className="w-24 bg-gray-700/50 border border-gray-600 rounded-md py-3 px-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200"
            aria-label="Number of slides"
          />
          <button
            type="submit"
            disabled={disabled}
            className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed transition duration-200 active:active-press"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>Generate</span>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 text-gray-300">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={useThinking} onChange={(e) => handleThinkingChange(e.target.checked)} disabled={disabled || useSearch} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500" />
          Enable Thinking Mode
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={useSearch} onChange={(e) => handleSearchChange(e.target.checked)} disabled={disabled} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500" />
          Use Google Search
        </label>
      </div>
    </form>
  );
};