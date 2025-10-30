import React from 'react';
import type { Slide as SlideType } from '../types';

interface SlideProps {
  slide: SlideType;
}

export const Slide: React.FC<SlideProps> = ({ slide }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-2xl w-full aspect-[16/9] flex flex-col overflow-hidden">
      <div className="w-full h-1/2 md:h-3/5 relative">
        {slide.imageUrl.startsWith('data:image') ? (
            <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <p className="text-gray-400">Loading image...</p>
            </div>
        )}
         <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent"></div>
      </div>
      <div className="p-6 md:p-8 lg:p-10 flex-grow flex flex-col justify-center h-1/2 md:h-2/5 relative">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 line-clamp-2">
          {slide.title}
        </h2>
        <ul className="space-y-2 list-disc list-inside text-gray-300 text-sm md:text-base lg:text-lg">
          {slide.content.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
        {slide.sources && slide.sources.length > 0 && (
          <div className="mt-4 pt-2 border-t border-gray-700">
            <h4 className="text-xs font-semibold text-gray-400 mb-1">Sources:</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {slide.sources.map((source, index) => (
                <a 
                  key={index}
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:underline truncate"
                  title={source.title}
                >
                  {new URL(source.uri).hostname}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
