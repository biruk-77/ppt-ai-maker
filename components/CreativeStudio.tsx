import React, { useState } from 'react';
import { generateStandaloneImage, generateVideo, editImage } from '../services/geminiService';
import { Loader } from './Loader';
import { SparklesIcon } from './icons/SparklesIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';

interface CreativeStudioProps {
  isVeoKeyReady: boolean;
  onSelectVeoKey: () => void;
  onError: (error: Error) => void;
}

export const CreativeStudio: React.FC<CreativeStudioProps> = ({ isVeoKeyReady, onSelectVeoKey, onError }) => {
  const [activeTool, setActiveTool] = useState<'image' | 'video' | 'edit'>('image');

  return (
    <div className="flex-grow flex flex-col items-center mt-8 text-center w-full">
        <div className="flex p-1.5 space-x-2 bg-gray-800 rounded-xl mb-8">
            <ToolButton icon={<PhotoIcon className="w-5 h-5" />} label="Generate Image" active={activeTool === 'image'} onClick={() => setActiveTool('image')} />
            <ToolButton icon={<VideoCameraIcon className="w-5 h-5" />} label="Generate Video" active={activeTool === 'video'} onClick={() => setActiveTool('video')} />
            <ToolButton icon={<PencilSquareIcon className="w-5 h-5" />} label="Edit Image" active={activeTool === 'edit'} onClick={() => setActiveTool('edit')} />
        </div>
        
        <div className="w-full max-w-4xl">
            {activeTool === 'image' && <ImageGenerator />}
            {activeTool === 'video' && <VideoGenerator isVeoKeyReady={isVeoKeyReady} onSelectVeoKey={onSelectVeoKey} onError={onError} />}
            {activeTool === 'edit' && <ImageEditor />}
        </div>
    </div>
  );
};

const ToolButton: React.FC<{icon: React.ReactNode, label: string, active: boolean, onClick: () => void}> = ({ icon, label, active, onClick}) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${active ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
        {icon} {label}
    </button>
)

const ImageGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt) { setError("Please enter a prompt."); return; }
        setIsLoading(true); setError(''); setImageUrl('');
        try {
            const url = await generateStandaloneImage(prompt, aspectRatio);
            setImageUrl(url);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Image Generation</h2>
            <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="A robot holding a red skateboard" className="flex-grow w-full bg-gray-700/50 border border-gray-600 rounded-md py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500" />
                <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded-md py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500">
                    <option value="16:9">16:9</option> <option value="9:16">9:16</option> <option value="1:1">1:1</option> <option value="4:3">4:3</option> <option value="3:4">3:4</option>
                </select>
                <button onClick={handleGenerate} disabled={isLoading} className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-indigo-500 disabled:opacity-50 active:active-press">
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </div>
            {error && <p className="text-red-400">{error}</p>}
            {isLoading && <Loader message="Generating your masterpiece..." />}
            {imageUrl && <img src={imageUrl} alt="Generated" className="mt-4 rounded-lg mx-auto" style={{maxHeight: '50vh'}}/>}
        </div>
    );
};

const VideoGenerator: React.FC<{isVeoKeyReady: boolean, onSelectVeoKey: () => void, onError: (e: Error) => void}> = ({ isVeoKeyReady, onSelectVeoKey, onError }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const handleGenerate = async () => {
        if (!prompt) { onError(new Error("Please enter a prompt.")); return; }
        setIsLoading(true); setLoadingMessage('Initializing video generation...'); onError(new Error('')); setVideoUrl('');
        try {
            const url = await generateVideo(prompt, aspectRatio, imageFile || undefined);
            setVideoUrl(url);
        } catch (e) {
            onError(e instanceof Error ? e : new Error('An unknown error occurred during video generation.'));
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    if (!isVeoKeyReady) {
        return (
            <div className="text-center p-8 bg-gray-800 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Veo Video Generation</h3>
                <p className="text-gray-400 mb-4">This feature requires a dedicated API key. Please select your key to proceed.</p>
                <p className="text-xs text-gray-500 mb-4">For more information on billing, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">documentation</a>.</p>
                <button onClick={onSelectVeoKey} className="bg-indigo-600 text-white font-semibold py-2 px-5 rounded-md hover:bg-indigo-500">Select API Key</button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
             {isLoading && <Loader message={loadingMessage} />}
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Video Generation</h2>
            <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="A neon hologram of a cat driving at top speed" className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500" />
            <div className="flex items-center justify-center gap-4">
                <label>Aspect Ratio:</label>
                <label className="flex items-center gap-2"><input type="radio" name="aspect" value="16:9" checked={aspectRatio === '16:9'} onChange={() => setAspectRatio('16:9')} /> Landscape</label>
                <label className="flex items-center gap-2"><input type="radio" name="aspect" value="9:16" checked={aspectRatio === '9:16'} onChange={() => setAspectRatio('9:16')} /> Portrait</label>
            </div>
            <div className="flex items-center justify-center gap-2">
                 <label htmlFor="video-image-upload" className="cursor-pointer bg-gray-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-500">
                    {imageFile ? `${imageFile.name}` : 'Upload Start Image (Optional)'}
                </label>
                <input id="video-image-upload" type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="hidden" />
                {imageFile && <button onClick={() => setImageFile(null)} className="text-red-400 text-sm">(remove)</button>}
            </div>
            <button onClick={handleGenerate} disabled={isLoading} className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-indigo-500 disabled:opacity-50 active:active-press">
                {isLoading ? 'This can take a few minutes...' : 'Generate Video'}
            </button>
            {videoUrl && <video src={videoUrl} controls autoPlay loop className="mt-4 rounded-lg mx-auto" style={{maxHeight: '50vh', aspectRatio: aspectRatio}}/>}
        </div>
    );
};

const ImageEditor = () => {
    const [prompt, setPrompt] = useState('');
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setOriginalImage(event.target?.result as string);
                setEditedImage(null);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleEdit = async () => {
        if (!originalImage || !prompt) { setError("Please upload an image and enter an edit prompt."); return; }
        setIsLoading(true); setError('');
        try {
            const url = await editImage(originalImage, prompt);
            setEditedImage(url);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Image Editor</h2>
            <label htmlFor="edit-image-upload" className="cursor-pointer bg-gray-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-500">
                {originalImage ? 'Change Image' : 'Upload an Image to Edit'}
            </label>
            <input id="edit-image-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            
            {originalImage && (
                <>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Add a retro filter" className="flex-grow w-full bg-gray-700/50 border border-gray-600 rounded-md py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500" />
                    <button onClick={handleEdit} disabled={isLoading} className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-indigo-500 disabled:opacity-50 active:active-press">
                        {isLoading ? 'Editing...' : 'Apply Edit'}
                    </button>
                </div>
                <div className="flex gap-4 justify-center mt-4">
                    <div className="text-center">
                        <h4 className="font-semibold mb-2">Original</h4>
                        <img src={originalImage} alt="Original" className="rounded-lg" style={{maxHeight: '40vh'}}/>
                    </div>
                    <div className="text-center">
                        <h4 className="font-semibold mb-2">Edited</h4>
                        {isLoading && !editedImage && <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg" style={{maxHeight: '40vh', aspectRatio: '1/1'}}><Loader message="Editing..." /></div>}
                        {editedImage && <img src={editedImage} alt="Edited" className="rounded-lg" style={{maxHeight: '40vh'}}/>}
                    </div>
                </div>
                </>
            )}
            {error && <p className="text-red-400">{error}</p>}
        </div>
    )
}
