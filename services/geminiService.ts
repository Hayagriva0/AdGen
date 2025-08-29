
import { GoogleGenAI, Type } from "@google/genai";
import type { AdGenRequest, FileWithPreview, AdPackage } from '../types';

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
    You are AdGen — a multimodal advertising director + generator.
    Your role is to take user inputs and output a complete advertising package.
    You MUST adhere strictly to all rules and output a valid JSON object matching the provided schema first, followed by human-readable sections.

    **User Inputs:**
    - **Product Description:** ${formData.productDescription}
    - **Campaign Goals:** ${formData.campaignGoals}
    - **Brand Guidelines:** ${formData.brandGuidelines || 'Not provided. Please infer from product and tone.'}
    - **Tone:** ${formData.tone}
    - **Channels:** ${formData.channels.join(', ')}
    - **Target Regions (for localization):** ${formData.regions}

    **Attached Assets:**
    - ${formData.productImages.length} product image(s).
    - ${formData.celebrityImages.length} celebrity/influencer image(s). If none, you must generate a lookalike original model and label it 'No-Clearance'.

    Now, generate the complete advertising package based on these inputs and the comprehensive rules you have been given. The primary output must be a single JSON object.
  `;
};

const getResponseSchema = () => ({
  type: Type.OBJECT,
  properties: {
    campaign_brief: { 
      type: Type.OBJECT,
      properties: { 
        title: { type: Type.STRING }, 
        hook: { type: Type.STRING }, 
        value_props: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    audience: {
      type: Type.OBJECT,
      properties: {
        age_range: { type: Type.STRING },
        segments: { type: Type.ARRAY, items: { type: Type.STRING } },
        insight: { type: Type.STRING }
      }
    },
    kpi: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.STRING },
        goal: { type: Type.STRING }
      }
    },
    variants: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          channel: { type: Type.STRING },
          duration_s: { type: Type.NUMBER },
          aspect_ratio: { type: Type.STRING },
          storyboard: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                scene_id: { type: Type.STRING },
                duration_s: { type: Type.NUMBER },
                shot_type: { type: Type.STRING },
                camera_move: { type: Type.STRING },
                framing: { type: Type.STRING },
                action: { type: Type.STRING },
                dialogue_vo: { type: Type.STRING },
                onscreen_text: { type: Type.STRING },
                color_palette: { type: Type.ARRAY, items: { type: Type.STRING } },
                typography: { type: Type.STRING },
                music_sfx: { type: Type.STRING },
                transition: { type: Type.STRING },
                assets_needed: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          copy: {
            type: Type.OBJECT,
            properties: { headline: { type: Type.STRING }, body: { type: Type.STRING }, cta: { type: Type.STRING } }
          },
          render_specs: {
            type: Type.OBJECT,
            properties: { resolution: { type: Type.STRING }, format: { type: Type.STRING }, filename: { type: Type.STRING } }
          },
          ab_tests: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { label: { type: Type.STRING }, change: { type: Type.STRING } }
            }
          },
          legal_note: { type: Type.STRING }
        }
      }
    },
    assets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING },
          purpose: { type: Type.STRING },
          notes: { type: Type.STRING }
        }
      }
    },
    style_guide: {
      type: Type.OBJECT,
      properties: {
        colors: { type: Type.ARRAY, items: { type: Type.STRING } },
        typography: { type: Type.STRING },
        logo_placement: { type: Type.STRING },
        motion_easing: { type: Type.STRING }
      }
    },
    production_checklist: { type: Type.ARRAY, items: { type: Type.STRING } },
    disclaimer_legal: { type: Type.STRING }
  }
});


export const generateAdPackage = async (formData: AdGenRequest): Promise<AdPackage> => {
  const textPrompt = buildPrompt(formData);
  const imageParts = await Promise.all([
    ...formData.productImages.map(fileToGenerativePart),
    ...formData.celebrityImages.map(fileToGenerativePart),
  ]);

  const contents = {
    parts: [{ text: textPrompt }, ...imageParts]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: getResponseSchema(),
        temperature: 0.7
      }
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("Received an empty response from the AI. Please try refining your inputs.");
    }

    const parsedJson = JSON.parse(jsonText);
    return parsedJson as AdPackage;

  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    if (error.message.includes('JSON')) {
       throw new Error("The AI returned an invalid JSON response. Please try again.");
    }
    throw new Error(`Failed to generate ad package: ${error.message}`);
  }
};
