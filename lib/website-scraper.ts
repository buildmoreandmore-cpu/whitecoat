import { GoogleGenAI } from '@google/genai';

export interface VisualStyle {
  colorPalette: string[];
  photographyStyle: string;
  overallAesthetic: string;
  brandMood: string;
  imageDescription: string;
}

export interface WebsiteInsights {
  products: string[];
  pricing: string;
  brandMessaging: string;
  uniqueSellingPoints: string[];
  targetAudience: string;
  testimonials: string[];
  keyBenefits: string[];
  rawContent: string;
  visualStyle?: VisualStyle;
  productImageUrls?: string[];
}

const EXTRACTION_PROMPT = `You are analyzing a healthcare/medical brand's website. Extract the following information from the website content provided. Be specific and detailed.

Return ONLY valid JSON with this structure:
{
  "products": ["List of products or services offered"],
  "pricing": "Pricing information if available, or 'Not listed' if not found",
  "brandMessaging": "The main brand message, tagline, or value proposition",
  "uniqueSellingPoints": ["What makes this brand unique", "Key differentiators"],
  "targetAudience": "Who the brand appears to be targeting based on messaging",
  "testimonials": ["Any customer testimonials or reviews found"],
  "keyBenefits": ["Main benefits highlighted for customers"]
}

Website content to analyze:`;

interface ScrapeResult {
  textContent: string;
  html: string;
  finalUrl: string;
}

export async function scrapeWebsite(url: string): Promise<ScrapeResult> {
  try {
    // Ensure URL has protocol and is valid
    let fetchUrl = url.trim();
    if (!fetchUrl.startsWith('http://') && !fetchUrl.startsWith('https://')) {
      fetchUrl = `https://${fetchUrl}`;
    }

    // Validate URL format
    try {
      new URL(fetchUrl);
    } catch {
      throw new Error(`Invalid URL format: ${url}`);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WhiteCoatBrief/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }

    const html = await response.text();

    // Extract text content from HTML (basic extraction)
    const textContent = extractTextFromHtml(html);

    // Limit content to avoid token limits
    const truncatedContent = textContent.slice(0, 15000);

    return {
      textContent: truncatedContent,
      html,
      finalUrl: response.url || fetchUrl,
    };
  } catch (error) {
    console.error('Website scraping error:', error);
    throw new Error(`Could not fetch website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractTextFromHtml(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Replace common block elements with newlines
  text = text.replace(/<\/(div|p|h[1-6]|li|tr|section|article|header|footer)>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&rsquo;/g, "'");
  text = text.replace(/&lsquo;/g, "'");
  text = text.replace(/&rdquo;/g, '"');
  text = text.replace(/&ldquo;/g, '"');
  text = text.replace(/&mdash;/g, '—');
  text = text.replace(/&ndash;/g, '–');

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/\n\s+/g, '\n');
  text = text.replace(/\n+/g, '\n');

  return text.trim();
}

function extractImageUrls(html: string, baseUrl: string): string[] {
  const imageUrls: string[] = [];

  // Match img tags with src attribute
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    let imgUrl = match[1];

    // Skip data URLs, tiny images, icons, and tracking pixels
    if (imgUrl.startsWith('data:') ||
        imgUrl.includes('pixel') ||
        imgUrl.includes('tracking') ||
        imgUrl.includes('icon') ||
        imgUrl.includes('logo') ||
        imgUrl.includes('favicon') ||
        imgUrl.includes('1x1') ||
        imgUrl.includes('spacer')) {
      continue;
    }

    // Convert relative URLs to absolute
    if (imgUrl.startsWith('//')) {
      imgUrl = 'https:' + imgUrl;
    } else if (imgUrl.startsWith('/')) {
      const base = new URL(baseUrl);
      imgUrl = base.origin + imgUrl;
    } else if (!imgUrl.startsWith('http')) {
      const base = new URL(baseUrl);
      imgUrl = base.origin + '/' + imgUrl;
    }

    imageUrls.push(imgUrl);
  }

  // Also check for background images in style attributes
  const bgRegex = /background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/gi;
  while ((match = bgRegex.exec(html)) !== null) {
    let imgUrl = match[1];
    if (!imgUrl.startsWith('data:')) {
      if (imgUrl.startsWith('//')) {
        imgUrl = 'https:' + imgUrl;
      } else if (imgUrl.startsWith('/')) {
        const base = new URL(baseUrl);
        imgUrl = base.origin + imgUrl;
      } else if (!imgUrl.startsWith('http')) {
        const base = new URL(baseUrl);
        imgUrl = base.origin + '/' + imgUrl;
      }
      imageUrls.push(imgUrl);
    }
  }

  // Remove duplicates and return first 5 likely product/hero images
  return Array.from(new Set(imageUrls)).slice(0, 5);
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WhiteCoatBrief/1.0)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) return null;

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

async function analyzeVisualStyle(imageBase64: string): Promise<VisualStyle | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Analyze this product/brand image and extract the visual style. Return ONLY valid JSON:
{
  "colorPalette": ["primary color", "secondary color", "accent color"],
  "photographyStyle": "Describe the photography style (e.g., 'clean product shots on white background', 'lifestyle photography with natural lighting', 'clinical/medical aesthetic')",
  "overallAesthetic": "Describe the overall visual aesthetic (e.g., 'modern minimalist', 'warm and approachable', 'premium luxury', 'clinical and trustworthy')",
  "brandMood": "The mood/feeling conveyed (e.g., 'professional', 'friendly', 'innovative', 'calming')",
  "imageDescription": "Brief description of what's shown in the image"
}`;

  try {
    // Extract mime type and data from base64 string
    const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) return null;

    const mimeType = matches[1];
    const base64Data = matches[2];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Data } }
          ]
        }
      ],
      config: {
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
    });

    let jsonText = response.text?.trim() || '';

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    return JSON.parse(jsonText) as VisualStyle;
  } catch (error) {
    console.error('Failed to analyze visual style:', error);
    return null;
  }
}

export async function extractWebsiteInsights(websiteContent: string): Promise<WebsiteInsights> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: EXTRACTION_PROMPT + '\n\n' + websiteContent,
    config: {
      temperature: 0.3,
      maxOutputTokens: 2000,
    },
  });

  let jsonText = response.text?.trim() || '';

  // Remove markdown code blocks if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7);
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3);
  }
  jsonText = jsonText.trim();

  try {
    const parsed = JSON.parse(jsonText);
    return {
      ...parsed,
      rawContent: websiteContent.slice(0, 2000), // Keep some raw content for context
    } as WebsiteInsights;
  } catch (error) {
    console.error('Failed to parse website insights:', jsonText);
    // Return basic structure if parsing fails
    return {
      products: [],
      pricing: 'Could not extract',
      brandMessaging: 'Could not extract',
      uniqueSellingPoints: [],
      targetAudience: 'Could not extract',
      testimonials: [],
      keyBenefits: [],
      rawContent: websiteContent.slice(0, 2000),
    };
  }
}

export async function getWebsiteInsights(url: string): Promise<WebsiteInsights | null> {
  try {
    console.log(`Scraping website: ${url}`);
    const { textContent, html, finalUrl } = await scrapeWebsite(url);
    console.log(`Extracted ${textContent.length} characters from website`);

    // Extract text-based insights
    const insights = await extractWebsiteInsights(textContent);
    console.log('Website text insights extracted successfully');

    // Extract image URLs from HTML
    const imageUrls = extractImageUrls(html, finalUrl);
    console.log(`Found ${imageUrls.length} potential product images`);
    insights.productImageUrls = imageUrls;

    // Try to analyze visual style from first available image
    if (imageUrls.length > 0) {
      console.log('Analyzing visual style from website images...');
      for (const imageUrl of imageUrls.slice(0, 3)) {
        try {
          const imageBase64 = await fetchImageAsBase64(imageUrl);
          if (imageBase64) {
            const visualStyle = await analyzeVisualStyle(imageBase64);
            if (visualStyle) {
              insights.visualStyle = visualStyle;
              console.log('Visual style extracted:', visualStyle.overallAesthetic);
              break; // Successfully analyzed one image
            }
          }
        } catch (error) {
          console.error(`Failed to analyze image ${imageUrl}:`, error);
          // Continue to next image
        }
      }
    }

    return insights;
  } catch (error) {
    console.error('Failed to get website insights:', error);
    return null;
  }
}
