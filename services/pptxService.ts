import type { Slide } from '../types';

export const exportToPptx = async (slides: Slide[]): Promise<void> => {
    // Dynamically import the library only when the function is called.
    const { default: PptxGenJS } = await import('pptxgenjs');
    
    const pptx = new PptxGenJS();
    
    pptx.layout = 'LAYOUT_16x9';
    
    // Define a master slide for a consistent, professional design
    pptx.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: '1F2937' }, // gray-800
        objects: [
            {
                'rect': { x: 0, y: 0, w: '100%', h: 0.75, fill: { color: '4338CA' } } // Indigo-700 header bar
            },
            {
                'placeholder': {
                    options: {
                        name: 'title',
                        type: 'title',
                        x: 0.5,
                        y: 0.1,
                        w: 9,
                        h: 0.6,
                        color: 'FFFFFF',
                        fontFace: 'Inter',
                        bold: true,
                        fontSize: 32,
                    },
                    text: 'Title Placeholder',
                }
            },
            {
                'placeholder': {
                     options: {
                        name: 'body',
                        type: 'body',
                        x: 5.5,
                        y: 1.5,
                        w: 4,
                        h: 3.5,
                        color: 'F3F4F6', // gray-100
                        fontFace: 'Inter',
                        fontSize: 16,
                        bullet: { type: 'number', style: 'romanLcPeriod' }
                    },
                    text: 'Content Placeholder'
                }
            },
             {
                'image': {
                    name: 'image',
                    x: 0.5,
                    y: 1.5,
                    w: 4.5,
                    h: 3.5,
                    sizing: { type: 'cover', w: 4.5, h: 3.5 }
                }
            },
            {
                'text': {
                    options: { x: 0.5, y: '92%', w: '90%', align: 'center', fontSize: 10, color: '9CA3AF' },
                    text: 'Powered by Gemini API'
                }
            }
        ]
    });

    for (const slideData of slides) {
        const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
        
        slide.addText(slideData.title, { placeholder: 'title', 
            // Add animations
            animation: {
                effect: 'fadeIn',
                duration: 1,
                delay: 0.5
            }
        });
        
        slide.addText(slideData.content.join('\n'), { placeholder: 'body',
            animation: {
                effect: 'fadeIn',
                duration: 1,
                delay: 1
            }
        });
        
        // Correctly format the base64 image data for the library
        const imageData = slideData.imageUrl.substring(slideData.imageUrl.indexOf(':') + 1);
        slide.addImage({ data: imageData, placeholder: 'image',
             animation: {
                effect: 'fadeIn',
                duration: 1,
                delay: 0.25
            }
        });
    }

    await pptx.writeFile({ fileName: 'AI-Presentation.pptx' });
};