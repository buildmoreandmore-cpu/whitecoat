import { GoogleGenAI, Modality } from '@google/genai';

const MAX_CONCURRENT_REQUESTS = 3;
const REQUEST_DELAY_MS = 500;

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate an image using Gemini 2.5 Flash
 * Cost: ~$0.001 per image (100x cheaper than Glif)
 */
export async function generateImage(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  console.log('[generateImage] Starting image generation, prompt length:', prompt.length);
  console.log('[generateImage] Prompt preview:', prompt.slice(0, 150) + '...');

  const ai = new GoogleGenAI({ apiKey });

  let response;
  try {
    console.log('[generateImage] Calling Gemini API with model: gemini-2.5-flash-image');
    response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `Generate an image: ${prompt}`,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });
    console.log('[generateImage] Gemini API response received');
  } catch (error) {
    console.error('[generateImage] Gemini API call failed:', error);
    console.error('[generateImage] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[generateImage] Error message:', error instanceof Error ? error.message : String(error));
    throw error;
  }

  // Extract image from response
  console.log('[generateImage] Extracting image from response...');
  console.log('[generateImage] Candidates count:', response.candidates?.length || 0);

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      console.log('[generateImage] Image found, mime type:', part.inlineData.mimeType);
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  console.error('[generateImage] No image in response. Response structure:', JSON.stringify(response, null, 2).slice(0, 500));
  throw new Error('Gemini did not return an image');
}

export interface ImageGenerationResult {
  prompt: string;
  imageUrl: string | null;
  error: string | null;
  adNumber: number;
  imageNumber: number;
}

export async function generateImagesParallel(
  prompts: Array<{ prompt: string; adNumber: number; imageNumber: number }>,
  onProgress?: (completed: number, total: number, result: ImageGenerationResult) => void
): Promise<ImageGenerationResult[]> {
  const results: ImageGenerationResult[] = [];
  let completed = 0;

  // Process in batches
  for (let i = 0; i < prompts.length; i += MAX_CONCURRENT_REQUESTS) {
    const batch = prompts.slice(i, i + MAX_CONCURRENT_REQUESTS);

    const batchPromises = batch.map(async ({ prompt, adNumber, imageNumber }) => {
      try {
        const imageUrl = await generateImage(prompt);
        return {
          prompt,
          imageUrl,
          error: null,
          adNumber,
          imageNumber,
        };
      } catch (error) {
        return {
          prompt,
          imageUrl: null,
          error: error instanceof Error ? error.message : 'Unknown error',
          adNumber,
          imageNumber,
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);

    for (const result of batchResults) {
      results.push(result);
      completed++;
      onProgress?.(completed, prompts.length, result);
    }

    // Add delay between batches
    if (i + MAX_CONCURRENT_REQUESTS < prompts.length) {
      await delay(REQUEST_DELAY_MS);
    }
  }

  return results;
}
