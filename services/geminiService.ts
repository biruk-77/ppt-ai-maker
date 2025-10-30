import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import type { SlideStructure } from '../types';

// A new GoogleGenAI instance is created for each call to ensure the latest API key from the dialog is used.
const getAI = () => {
    if (!process.env.API_KEY) {
        // This runtime check is safer than a top-level check
        throw new Error("API_KEY environment variable is not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export interface GeneratePresentationParams {
    prompt: string;
    slideCount: number;
    useThinking: boolean;
    useSearch: boolean;
}

const presentationSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "The main title for this presentation slide. Should be concise and engaging.",
        },
        content: {
          type: Type.ARRAY,
          items: { 
            type: Type.STRING,
            description: "A single bullet point or a short sentence for the slide content." 
          },
          description: "An array of 2 to 4 bullet points expanding on the slide's title. Each bullet point should be a complete sentence.",
        },
        imagePrompt: {
            type: Type.STRING,
            description: "A detailed, descriptive prompt for an AI image generator to create a visually appealing and relevant image for this slide. Describe the scene, style (e.g., photorealistic, cinematic, minimalist), and mood."
        }
      },
      required: ["title", "content", "imagePrompt"],
    },
};

const parsePresentationFromText = (text: string): { slides: SlideStructure[] } => {
    const slides: SlideStructure[] = [];
    const slideBlocks = text.split('---SLIDE---').filter(block => block.trim() !== '');

    if (slideBlocks.length === 0 && text.trim().length > 0) {
        throw new Error("The AI response could not be parsed. The slide separator '---SLIDE---' was not found.");
    }

    for (const block of slideBlocks) {
        const titleMatch = block.match(/TITLE:\s*(.*)/);
        const contentMatch = block.match(/CONTENT:\s*([\s\S]*?)IMAGE_PROMPT:/);
        const imagePromptMatch = block.match(/IMAGE_PROMPT:\s*(.*)/);

        if (titleMatch && contentMatch && imagePromptMatch) {
            const title = titleMatch[1].trim();
            const content = contentMatch[1].trim().split('\n').map(line => line.replace(/^-/, '').trim()).filter(line => line);
            const imagePrompt = imagePromptMatch[1].trim();
            slides.push({ title, content, imagePrompt });
        }
    }
    
    if (slides.length === 0) {
        throw new Error("The AI returned a response, but it couldn't be formatted into slides. Please try a different topic or wording.");
    }
    return { slides };
};

const distributeSources = (slides: SlideStructure[], sources: any[] | undefined): SlideStructure[] => {
    if (!sources || sources.length === 0) {
        return slides;
    }
    const validSources = sources.map((s: any) => ({ 
        uri: s.web?.uri || s.maps?.uri, 
        title: s.web?.title || s.maps?.title 
    })).filter(s => s.uri && s.title);
    
    if (validSources.length === 0) return slides;

    // A simple approach: attach all retrieved sources to every slide for user reference.
    return slides.map(slide => ({
        ...slide,
        sources: validSources
    }));
};

export const generatePresentationStructure = async (params: GeneratePresentationParams): Promise<{ slides: SlideStructure[] }> => {
    const ai = getAI();
    const { prompt, slideCount, useThinking, useSearch } = params;

    const isDetailedScript = prompt.length > 500 && /\r|\n/.test(prompt);

    if (isDetailedScript) {
        // SCRIPT PARSING MODE
        const model = 'gemini-2.5-pro';
        const config: any = {
            responseMimeType: "application/json",
            responseSchema: presentationSchema,
        };
        if (useThinking) {
            config.thinkingConfig = { thinkingBudget: 32768 };
        }
        
        const contents = `You are an expert presentation script formatter. The user has provided a detailed script for a presentation. Your task is to parse this script and format it into a structured JSON array based on the provided schema.
- Do NOT summarize, alter, or add new content. Preserve the original text for titles and content points exactly as it is given.
- For EACH slide in the script, you MUST generate a relevant, descriptive image prompt in ENGLISH. The image prompt should be based on the content of that specific slide. The user's script is in Amharic, so you will need to understand it to create appropriate image prompts.
- Ensure the final output is a valid JSON array matching the schema.

Here is the script:
---SCRIPT START---
${prompt}
---SCRIPT END---`;
        
        const response = await ai.models.generateContent({ model, contents, config });
        const jsonText = response.text.trim();
        try {
            const parsedJson = JSON.parse(jsonText);
            if (Array.isArray(parsedJson)) {
                return { slides: parsedJson as SlideStructure[] };
            }
            throw new Error("Parsed JSON is not an array.");
        } catch (e) {
            console.error("Failed to parse presentation structure JSON from script:", e);
            throw new Error("The AI failed to format the provided script. Please check the script format and try again.");
        }

    } else if (useSearch) {
        // SEARCH GROUNDING MODE (TEXT PARSING)
        const model = 'gemini-2.5-flash';
        const config = { tools: [{googleSearch: {}}] };
        const contents = `Create a presentation about "${prompt}". The presentation should have exactly ${slideCount} slides.
For EACH slide, you MUST provide a title, 2-4 content bullet points, and a detailed image prompt.
You MUST format the ENTIRE output as a single plain text string. Each slide MUST be separated by the exact string "---SLIDE---".
Within each slide block, you MUST use the following format exactly:
TITLE: [Your Title Here]
CONTENT:
- [Bullet point 1]
- [Bullet point 2]
IMAGE_PROMPT: [Your detailed English image prompt here]`;
        
        const response = await ai.models.generateContent({ model, contents, config });
        const { slides } = parsePresentationFromText(response.text);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const slidesWithSources = distributeSources(slides, sources);

        return { slides: slidesWithSources };
        
    } else {
        // DEFAULT TOPIC-TO-PRESENTATION MODE (JSON)
        const model = useThinking ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
        const config: any = {
            responseMimeType: "application/json",
            responseSchema: presentationSchema,
        };
        if (useThinking) {
            config.thinkingConfig = { thinkingBudget: 32768 };
        }
        
        const contents = `Create a presentation about "${prompt}". The presentation should have exactly ${slideCount} slides, including an engaging title slide and a strong concluding slide. For each slide, provide a title, 2-4 content bullet points, and a detailed descriptive prompt for an image generator, following the provided JSON schema.`;

        const response = await ai.models.generateContent({ model, contents, config });
        const jsonText = response.text.trim();
        try {
            const parsedJson = JSON.parse(jsonText);
             if (Array.isArray(parsedJson) && parsedJson.every(item => 'title' in item && 'content' in item && 'imagePrompt' in item)) {
                return { slides: parsedJson as SlideStructure[] };
            } else {
                throw new Error("Parsed JSON does not match the expected structure.");
            }
        } catch (e) {
            console.error("Failed to parse presentation structure JSON:", e);
            throw new Error("The AI returned an invalid presentation structure. Please try again.");
        }
    }
};

export const generateImage = async ({ prompt, title, content }: { prompt: string; title: string; content: string; }): Promise<string> => {
    const ai = getAI();
    const enhancedPrompt = `A visually compelling, professional image for a presentation slide.
    - Style: Cinematic, photorealistic, high-detail.
    - Slide Title: "${title}"
    - Slide Content Summary: ${content}
    - Core Image Subject: ${prompt}.
    - Theme: Incorporate elements of Ethiopian art, culture, people, traditional patterns, and landscapes.
    - Composition: Follow the rule of thirds, with a clear focal point. Avoid text in the image.`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: enhancedPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
        },
    });
    
    const image = response.generatedImages?.[0];
    if (image?.image?.imageBytes) {
        return `data:image/jpeg;base64,${image.image.imageBytes}`;
    }
    
    throw new Error("Image generation failed to return an image.");
};

export const generateStandaloneImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
        },
    });
    
    const image = response.generatedImages?.[0];
    if (image?.image?.imageBytes) {
        return `data:image/jpeg;base64,${image.image.imageBytes}`;
    }
    
    throw new Error("Image generation failed to return an image.");
};

function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
}

export const editImage = async (originalImage: string, editPrompt: string): Promise<string> => {
    const ai = getAI();
    const imageMimeType = originalImage.match(/data:(image\/[a-zA-Z]+);/)?.[1] || 'image/jpeg';
    const base64ImageData = originalImage.split(',')[1];
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64ImageData, mimeType: imageMimeType } },
                { text: editPrompt },
            ],
        },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
          if (part.inlineData) {
              const base64ImageBytes: string = part.inlineData.data;
              return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          }
      }
    }
    
    throw new Error("Image edit failed to return a new image.");
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16', imageFile?: File): Promise<string> => {
    const ai = getAI();
    
    const videoParams: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio
        }
    };
    
    if (imageFile) {
        const base64Image = await getBase64(imageFile);
        videoParams.image = {
            imageBytes: base64Image,
            mimeType: imageFile.type,
        };
    }

    let operation = await ai.models.generateVideos(videoParams);
    
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation completed but no download link was found.");
    }

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error("Failed to download the generated video.");
    }
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};