import React, { useState, useEffect, useCallback } from 'react';
import type { Slide as SlideType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Slide } from './Slide';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface PresentationPlayerProps {
  slides: SlideType[];
  onClose: () => void;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

export const PresentationPlayer: React.FC<PresentationPlayerProps> = ({ slides, onClose }) => {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = useCallback((newDirection: number) => {
    setPage(([currentPage]) => {
      let newIndex = currentPage + newDirection;
      if (newIndex < 0) {
        newIndex = slides.length - 1;
      } else if (newIndex >= slides.length) {
        newIndex = 0;
      }
      return [newIndex, newDirection];
    });
  }, [slides.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      paginate(1);
    } else if (e.key === 'ArrowLeft') {
      paginate(-1);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [paginate, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center p-4">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="w-full h-full"
        >
          <Slide slide={slides[page]} />
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-4 right-4 z-20">
        <button onClick={onClose} className="p-2 rounded-full bg-black/50 hover:bg-black/75 transition">
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
        <button onClick={() => paginate(-1)} className="p-2 rounded-full bg-black/50 hover:bg-black/75 transition">
          <ChevronLeftIcon className="w-8 h-8 text-white" />
        </button>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
        <button onClick={() => paginate(1)} className="p-2 rounded-full bg-black/50 hover:bg-black/75 transition">
          <ChevronRightIcon className="w-8 h-8 text-white" />
        </button>
      </div>
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
          {page + 1} / {slides.length}
      </div>
    </div>
  );
};
