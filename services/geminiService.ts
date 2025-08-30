
import { GoogleGenAI, Type } from "@google/genai";
import type { AdGenRequest, CreativeOutput } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

const buildPrompt = (formData: AdGenRequest) => {
  return `
    You are AdGen — a multimodal advertising creative generator.
    Your role is to take user inputs and generate a compelling ad concept.
    You MUST output a valid JSON object matching the provided schema.

    **User Inputs:**
    - **Product Description:** ${formData.productDescription}
    - **Tone:** ${formData.tone}

    **Attached Assets:**
    - ${formData.productImages.length} product image(s).
    - ${formData.celebrityImages.length} celebrity/influencer image(s).

    Based on these inputs, generate an ad concept including:
    1. A catchy headline.
    2. A short body copy.
    3. A clear call to action (CTA).
    4. A storyboard with 3 distinct scenes. For each scene, provide a scene_id (e.g., 's1'), a detailed visual description, the key action, the shot_type (e.g., 'wide shot', 'close-up'), and the overall mood (e.g., 'energetic', 'serene').
  `;
};

export const generateCreativeConcept = async (formData: AdGenRequest): Promise<CreativeOutput> => {
  const textPrompt = buildPrompt(formData);
  const imageParts = await Promise.all([
    ...formData.productImages.map(fileToGenerativePart),
    ...formData.celebrityImages.map(fileToGenerativePart),
  ]);

  const contents = {
    parts: [{ text: textPrompt }, ...imageParts]
  };

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
        headline: { type: Type.STRING },
        body: { type: Type.STRING },
        cta: { type: Type.STRING },
        storyboard: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    scene_id: { type: Type.STRING },
                    description: { type: Type.STRING },
                    action: { type: Type.STRING },
                    shot_type: { type: Type.STRING },
                    mood: { type: Type.STRING },
                }
            }
        }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7
      }
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("Received an empty response from the AI. Please try refining your inputs.");
    }

    const parsedJson = JSON.parse(jsonText);
    return parsedJson as CreativeOutput;

  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    if (error.message.includes('JSON')) {
       throw new Error("The AI returned an invalid JSON response. Please try again.");
    }
    throw new Error(`Failed to generate ad concept: ${error.message}`);
  }
};

export const generateAdImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      return imageUrl;
    } else {
      throw new Error("No image was generated. The response may have been blocked.");
    }

  } catch (error: any) {
    console.error('Image generation failed:', error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
};

export const generateAdVideo = async (prompt: string): Promise<string> => {
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.statusText}`);
        }
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);
    } catch (error: any) {
        console.error('Video generation failed:', error);
        throw new Error(`Failed to generate video: ${error.message}`);
    }
};
