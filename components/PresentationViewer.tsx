import React from 'react';
import type { Slide as SlideType } from '../types';
import { Slide } from './Slide';
import { PencilSquareIcon } from './icons/PencilSquareIcon';

interface PresentationViewerProps {
  slides: SlideType[];
  currentSlideIndex: number;
  setCurrentSlideIndex: (index: number) => void;
  onEditImage: (index: number) => void;
}

const SlideThumbnail: React.FC<{ slide: SlideType; isActive: boolean; onClick: () => void; onEdit: () => void; index: number; }> = ({ slide, isActive, onClick, onEdit, index }) => (
    <div 
      onClick={onClick}
      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${isActive ? 'border-indigo-500' : 'border-gray-700 hover:border-indigo-600'} aspect-[16/9] bg-gray-800 relative group flex-shrink-0 w-32 md:w-full`}
    >
      <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-2">
        <span className="text-white font-bold text-lg">{index + 1}</span>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onEdit(); }} 
        className="absolute top-1 right-1 bg-black/50 p-1.5 rounded-md text-white opacity-0 group-hover:opacity-100 hover:bg-black/75 transition-opacity"
        aria-label="Edit image"
      >
        <PencilSquareIcon className="w-4 h-4" />
      </button>
    </div>
);


export const PresentationViewer: React.FC<PresentationViewerProps> = ({ slides, currentSlideIndex, setCurrentSlideIndex, onEditImage }) => {
  if (slides.length === 0) {
    return (
      <div className="w-full aspect-[16/9] bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Your presentation will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 flex-grow min-h-0">
       <div className="md:w-3/4 lg:w-4/5 order-1 md:order-1 flex-grow min-h-0">
        <Slide slide={slides[currentSlideIndex]} />
      </div>
      <div className="md:w-1/4 lg:w-1/5 order-2 md:order-2">
        <div className="flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:max-h-[60vh] pb-2 md:pr-2 thumbnail-scrollbar-hide">
          {slides.map((slide, index) => (
            <SlideThumbnail
              key={index}
              slide={slide}
              index={index}
              isActive={index === currentSlideIndex}
              onClick={() => setCurrentSlideIndex(index)}
              onEdit={() => onEditImage(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
