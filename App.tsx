import React, { useState, useCallback, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { PresentationViewer } from './components/PresentationViewer';
import { Loader } from './components/Loader';
import { generatePresentationStructure, generateImage, editImage, GeneratePresentationParams } from './services/geminiService';
import { exportToPptx } from './services/pptxService';
import type { Slide } from './types';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { PlayIcon } from './components/icons/PlayIcon';
import { PresentationPlayer } from './components/PresentationPlayer';
import { NavTabs } from './components/NavTabs';
import { CreativeStudio } from './components/CreativeStudio';
import { ImageEditorModal } from './components/ImageEditorModal';


const App: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'presentation' | 'creative'>('presentation');
  const [isVeoKeyReady, setIsVeoKeyReady] = useState(false);

  const [editingSlide, setEditingSlide] = useState<{slide: Slide, index: number} | null>(null);

  const checkVeoKey = useCallback(async () => {
    if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
      setIsVeoKeyReady(true);
    } else {
      setIsVeoKeyReady(false);
    }
  }, []);

  useEffect(() => {
    checkVeoKey();
  }, [checkVeoKey]);

  const handleSelectVeoKey = useCallback(async () => {
    if (!window.aistudio) return;
    try {
      await window.aistudio.openSelectKey();
      // Assume success to improve UX, as hasSelectedApiKey can have a delay
      setIsVeoKeyReady(true); 
    } catch (e) {
      console.error("Error opening API key selection:", e);
      setIsVeoKeyReady(false);
    }
  }, []);

  const handleGenerate = useCallback(async (params: GeneratePresentationParams) => {
    if (!params.prompt.trim()) {
      setError('Please enter a topic for your presentation.');
      return;
    }
    if (params.slideCount < 1 || params.slideCount > 30) {
      setError('Please enter a slide count between 1 and 30.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Crafting presentation outline...');
    setError(null);
    setSlides([]);
    setCurrentSlideIndex(0);

    try {
      const { slides: presentationStructure } = await generatePresentationStructure(params);

      const generatedSlides: Slide[] = [];
      for (let i = 0; i < presentationStructure.length; i++) {
        const slideStructure = presentationStructure[i];
        setLoadingMessage(`Generating image for slide ${i + 1}: "${slideStructure.title}"`);

        const imageUrl = await generateImage({
          prompt: slideStructure.imagePrompt,
          title: slideStructure.title,
          content: slideStructure.content.join('; ')
        });

        const newSlide: Slide = {
          title: slideStructure.title,
          content: slideStructure.content,
          imageUrl: imageUrl,
          sources: slideStructure.sources
        };

        generatedSlides.push(newSlide);
        setSlides([...generatedSlides]);
      }

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? `An error occurred: ${e.message}` : 'An unknown error occurred.';
      if (e instanceof Error && e.message.includes("API key not valid")) {
        setError("Your API key is not valid. Please select a valid key for Veo models.");
        setIsVeoKeyReady(false); // Reset key status on auth error
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);
  
  const handleImageEditSave = async (editPrompt: string) => {
    if (!editingSlide || !editPrompt.trim()) return;

    setIsLoading(true);
    setLoadingMessage('Applying magical edits to your image...');
    setError(null);
    
    try {
      const originalImageUrl = editingSlide.slide.imageUrl;
      const newImageUrl = await editImage(originalImageUrl, editPrompt);

      setSlides(prevSlides => {
        const newSlides = [...prevSlides];
        newSlides[editingSlide.index] = { ...newSlides[editingSlide.index], imageUrl: newImageUrl };
        return newSlides;
      });

    } catch (e) {
      console.error("Image edit failed:", e);
      setError(e instanceof Error ? `Failed to edit image: ${e.message}` : 'An unknown image editing error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setEditingSlide(null);
    }
  };

  const handleExport = useCallback(async () => {
    if (slides.length === 0 || isExporting) return;
    setIsExporting(true);
    setError(null);
    try {
      await exportToPptx(slides);
    } catch (e) {
      console.error("Failed to export PPTX:", e);
      setError(e instanceof Error ? `Failed to export: ${e.message}` : 'An unknown export error occurred.');
    } finally {
      setIsExporting(false);
    }
  }, [slides, isExporting]);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col antialiased">
      {isLoading && <Loader message={loadingMessage} />}
      {isPresentationMode && <PresentationPlayer slides={slides} onClose={() => setIsPresentationMode(false)} />}
      {editingSlide && (
        <ImageEditorModal 
          imageUrl={editingSlide.slide.imageUrl}
          onClose={() => setEditingSlide(null)}
          onSave={handleImageEditSave}
        />
      )}

      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 shadow-lg sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-100">AI Creative Suite</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col">
        <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'presentation' && (
           <>
             {slides.length === 0 && !isLoading ? (
               <div className="flex-grow flex flex-col items-center justify-center text-center mt-8">
                 <div className="max-w-3xl w-full">
                   <h2 className="text-4xl font-bold text-gray-100 mb-4">Presentation Maker</h2>
                   <p className="text-lg text-gray-400 mb-8">
                     Enter a topic, and our AI will generate a complete presentation with culturally-rich visuals, up-to-date content, and powerful insights.
                   </p>
                   <PromptInput onGenerate={handleGenerate} disabled={isLoading} />
                   {error && <p className="text-red-400 mt-4">{error}</p>}
                 </div>
               </div>
             ) : (
               <div className="flex flex-col gap-6 flex-grow min-h-0 mt-8">
                 <div className="w-full">
                    <PromptInput onGenerate={handleGenerate} disabled={isLoading} />
                 </div>
                  {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                 
                 <div className="flex justify-center items-center gap-4 my-4">
                   <button
                     onClick={() => setIsPresentationMode(true)}
                     disabled={slides.length === 0}
                     className="flex items-center justify-center gap-2 bg-gray-700 text-white font-semibold py-2 px-5 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 active:active-press"
                   >
                     <PlayIcon className="w-5 h-5" />
                     <span>Play</span>
                   </button>
                   <button
                     onClick={handleExport}
                     disabled={slides.length === 0 || isExporting}
                     className="flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-5 rounded-md hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed transition duration-200 active:active-press"
                   >
                     <DownloadIcon className="w-5 h-5" />
                     <span>{isExporting ? 'Exporting...' : 'Export PPTX'}</span>
                   </button>
                 </div>

                 <PresentationViewer 
                   slides={slides} 
                   currentSlideIndex={currentSlideIndex} 
                   setCurrentSlideIndex={setCurrentSlideIndex}
                   onEditImage={(index) => setEditingSlide({ slide: slides[index], index })}
                 />
               </div>
             )}
          </>
        )}

        {activeTab === 'creative' && (
          <CreativeStudio 
            isVeoKeyReady={isVeoKeyReady} 
            onSelectVeoKey={handleSelectVeoKey}
            onError={(e) => {
              if (e.message.includes("Requested entity was not found") || e.message.includes("API key not valid")) {
                setError("Your API key is not valid or has insufficient permissions for Veo models. Please select a valid key.");
                setIsVeoKeyReady(false);
              } else {
                setError(e.message)
              }
            }}
          />
        )}

      </main>
       <footer className="text-center p-4 text-gray-500 text-sm border-t border-gray-800">
          Powered by Gemini API
      </footer>
    </div>
  );
};

export default App;