import { GoogleGenAI, Modality } from '@google/genai';

const GLIF_API_URL = 'https://simple-api.glif.app/clzmh32ij00069q49wni49ill';
const MAX_CONCURRENT_REQUESTS = 2;
const REQUEST_DELAY_MS = 2000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 5000;

interface GlifResponse {
  output?: string;
  error?: string;
}

// Gemini image generation as backup
async function generateImageWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set for backup image generation');
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: `Generate an image: ${prompt}`,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  // Extract image from response
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('Gemini did not return an image');
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateImage(prompt: string, retryCount = 0, useGeminiFallback = true): Promise<string> {
  const token = process.env.GLIF_API_TOKEN;

  // If no Glif token, go straight to Gemini
  if (!token) {
    if (useGeminiFallback) {
      console.log('No GLIF_API_TOKEN, using Gemini fallback');
      return generateImageWithGemini(prompt);
    }
    throw new Error('GLIF_API_TOKEN environment variable is not set');
  }

  try {
    const response = await fetch(GLIF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: prompt }),
    });

    // Handle rate limiting with retry
    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        console.log(`Rate limited, retrying in ${RETRY_DELAY_MS}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await delay(RETRY_DELAY_MS * (retryCount + 1)); // Exponential backoff
        return generateImage(prompt, retryCount + 1, useGeminiFallback);
      }
      // After max retries, fall back to Gemini
      if (useGeminiFallback) {
        console.log('Glif rate limit exceeded after retries, falling back to Gemini');
        return generateImageWithGemini(prompt);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Glif API error: ${response.status} - ${errorText}`);
    }

    const data: GlifResponse = await response.json();

    if (data.error) {
      throw new Error(`Glif API error: ${data.error}`);
    }

    if (!data.output) {
      throw new Error('Glif API returned no output');
    }

    return data.output;
  } catch (error) {
    // On any Glif error, try Gemini as fallback
    if (useGeminiFallback) {
      console.log(`Glif failed: ${error instanceof Error ? error.message : 'Unknown error'}, trying Gemini fallback`);
      return generateImageWithGemini(prompt);
    }
    throw error;
  }
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

  // Process in batches to avoid rate limiting
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

    // Add delay between batches to avoid rate limiting
    if (i + MAX_CONCURRENT_REQUESTS < prompts.length) {
      await delay(REQUEST_DELAY_MS);
    }
  }

  return results;
}
