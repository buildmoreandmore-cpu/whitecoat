const GLIF_API_URL = 'https://simple-api.glif.app/clozwqgs60013l80fkgmtf49o';
const MAX_CONCURRENT_REQUESTS = 5;
const REQUEST_DELAY_MS = 200;

interface GlifResponse {
  output?: string;
  error?: string;
}

export async function generateImage(prompt: string): Promise<string> {
  const token = process.env.GLIF_API_TOKEN;

  if (!token) {
    throw new Error('GLIF_API_TOKEN environment variable is not set');
  }

  const response = await fetch(GLIF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: prompt }),
  });

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
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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
