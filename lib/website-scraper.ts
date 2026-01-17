import { GoogleGenAI } from '@google/genai';

export interface VisualStyle {
  colorPalette: string[];
  photographyStyle: string;
  overallAesthetic: string;
  brandMood: string;
  imageDescription: string;
}

export interface Product {
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
  category?: string;
}

export interface WebsiteInsights {
  products: string[];
  structuredProducts: Product[];
  pricing: string;
  brandMessaging: string;
  uniqueSellingPoints: string[];
  targetAudience: string;
  testimonials: string[];
  keyBenefits: string[];
  certifications: string[];
  brandColors: string[];
  rawContent: string;
  visualStyle?: VisualStyle;
  productImageUrls?: string[];
}

const EXTRACTION_PROMPT = `You are analyzing a DTC (Direct-to-Consumer) brand's e-commerce website. Extract detailed information for creating effective advertising briefs. Be specific and detailed.

Return ONLY valid JSON with this structure:
{
  "products": ["Product name 1", "Product name 2"],
  "structuredProducts": [
    {
      "name": "Full Product Name",
      "description": "Product description or tagline from the website",
      "price": "$29.99 or price range",
      "category": "Category if identifiable (e.g., Skincare, Supplements, etc.)"
    }
  ],
  "pricing": "Price range or pricing model (e.g., '$15-$45', 'Subscription: $25/mo')",
  "brandMessaging": "The main brand message, tagline, or value proposition",
  "uniqueSellingPoints": ["What makes this brand unique", "Key differentiators"],
  "targetAudience": "Who the brand appears to be targeting based on messaging",
  "testimonials": ["Any customer testimonials or reviews found"],
  "keyBenefits": ["Main benefits highlighted for customers"],
  "certifications": ["FDA approved", "Dermatologist tested", "Cruelty-free", "etc."]
}

IMPORTANT:
- Extract ACTUAL product names from the website, not generic descriptions
- Include specific prices when visible
- Look for product descriptions, ingredients, or key features
- Identify any certifications, awards, or trust badges

Website content to analyze:`;

interface ScrapeResult {
  textContent: string;
  html: string;
  finalUrl: string;
}

/**
 * Extract brand colors from HTML/CSS content
 */
function extractColorsFromHtml(html: string): string[] {
  const colors: Set<string> = new Set();

  // Match hex colors (3 or 6 digit)
  const hexRegex = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;
  // Match rgb/rgba colors
  const rgbRegex = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/gi;

  // Extract from style tags
  const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  for (const styleTag of styleMatches) {
    const hexMatches = styleTag.match(hexRegex) || [];
    const rgbMatches = styleTag.match(rgbRegex) || [];
    hexMatches.forEach(c => colors.add(c.toUpperCase()));
    rgbMatches.forEach(c => colors.add(c.toLowerCase()));
  }

  // Extract from inline styles
  const inlineStyleRegex = /style=["']([^"']+)["']/gi;
  let match;
  while ((match = inlineStyleRegex.exec(html)) !== null) {
    const style = match[1];
    const hexMatches = style.match(hexRegex) || [];
    const rgbMatches = style.match(rgbRegex) || [];
    hexMatches.forEach(c => colors.add(c.toUpperCase()));
    rgbMatches.forEach(c => colors.add(c.toLowerCase()));
  }

  // Filter out common neutral colors (white, black, grays)
  const colorArray = Array.from(colors).filter(color => {
    const upper = color.toUpperCase();
    // Filter out pure white, black, and near-grays
    if (upper === '#FFFFFF' || upper === '#FFF' || upper === '#000000' || upper === '#000') return false;
    // Filter out common grays
    if (/^#([0-9A-F])\1\1$/i.test(color) || /^#([0-9A-F]{2})\1\1$/i.test(color)) return false;
    return true;
  });

  return colorArray.slice(0, 6);
}

/**
 * Try common e-commerce paths to find additional product pages
 */
async function scrapeMultiplePages(baseUrl: string): Promise<string[]> {
  const pages: string[] = [baseUrl];

  // Common e-commerce paths (deduped)
  const shopifyPaths = ['/collections/all', '/products', '/collections'];
  const commonPaths = ['/shop', '/store', '/all-products'];
  const allPaths = [...shopifyPaths, ...commonPaths];

  // Try each path with a HEAD request first (faster) - use shorter timeout
  for (const path of allPaths) {
    try {
      const testUrl = new URL(path, baseUrl).href;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced timeout

      const response = await fetch(testUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WhiteCoatBrief/1.0)',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      // Only add if we get a successful response and it's not the same as homepage
      if (response.ok && response.url !== baseUrl && !pages.includes(testUrl)) {
        pages.push(testUrl);
        console.log(`[scrapeMultiplePages] Found additional page: ${testUrl}`);
        if (pages.length >= 2) break; // Limit to 2 pages to reduce time
      }
    } catch (error) {
      // Silently continue if path doesn't exist or times out
      console.log(`[scrapeMultiplePages] Path ${path} not accessible`);
    }
  }

  return pages;
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

    // Limit content to avoid token limits (increased for better product extraction)
    const truncatedContent = textContent.slice(0, 30000);

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

  // Remove duplicates and return first 10 likely product/hero images (increased for better coverage)
  return Array.from(new Set(imageUrls)).slice(0, 10);
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

  console.log('[extractWebsiteInsights] Starting extraction, content length:', websiteContent.length);

  const ai = new GoogleGenAI({ apiKey });

  let response;
  try {
    console.log('[extractWebsiteInsights] Calling Gemini API...');
    response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: EXTRACTION_PROMPT + '\n\n' + websiteContent,
      config: {
        temperature: 0.3,
        maxOutputTokens: 4000, // Increased for structured product data
      },
    });
    console.log('[extractWebsiteInsights] Gemini API response received');
  } catch (error) {
    console.error('[extractWebsiteInsights] Gemini API call failed:', error);
    throw error;
  }

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

  // Try to find JSON object if response has extra text
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  console.log('[extractWebsiteInsights] Attempting to parse JSON, length:', jsonText.length);
  console.log('[extractWebsiteInsights] JSON preview:', jsonText.slice(0, 200) + '...');

  try {
    const parsed = JSON.parse(jsonText);
    console.log('[extractWebsiteInsights] JSON parsed successfully');
    console.log('[extractWebsiteInsights] Products found:', parsed.products?.length || 0);
    console.log('[extractWebsiteInsights] Structured products found:', parsed.structuredProducts?.length || 0);
    return {
      products: parsed.products || [],
      structuredProducts: parsed.structuredProducts || [],
      pricing: parsed.pricing || 'Could not extract',
      brandMessaging: parsed.brandMessaging || 'Could not extract',
      uniqueSellingPoints: parsed.uniqueSellingPoints || [],
      targetAudience: parsed.targetAudience || 'Could not extract',
      testimonials: parsed.testimonials || [],
      keyBenefits: parsed.keyBenefits || [],
      certifications: parsed.certifications || [],
      brandColors: [], // Will be populated by CSS extraction
      rawContent: websiteContent.slice(0, 2000), // Keep some raw content for context
    } as WebsiteInsights;
  } catch (error) {
    console.error('[extractWebsiteInsights] Failed to parse JSON:', error);
    console.error('[extractWebsiteInsights] Raw response was:', jsonText.slice(0, 500));
    // Return basic structure if parsing fails
    return {
      products: [],
      structuredProducts: [],
      pricing: 'Could not extract',
      brandMessaging: 'Could not extract',
      uniqueSellingPoints: [],
      targetAudience: 'Could not extract',
      testimonials: [],
      keyBenefits: [],
      certifications: [],
      brandColors: [],
      rawContent: websiteContent.slice(0, 2000),
    };
  }
}

// Helper to add timeout to any promise
async function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(errorMessage)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

export async function getWebsiteInsights(url: string): Promise<WebsiteInsights | null> {
  // Wrap the entire function with a 30-second timeout
  try {
    return await withTimeout(
      getWebsiteInsightsInternal(url),
      30000,
      'Website analysis timed out after 30 seconds'
    );
  } catch (error) {
    console.error('[getWebsiteInsights] Failed with timeout or error:', error);
    return null;
  }
}

async function getWebsiteInsightsInternal(url: string): Promise<WebsiteInsights | null> {
  try {
    // Ensure URL has protocol
    let baseUrl = url.trim();
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }

    // Validate URL format
    try {
      new URL(baseUrl);
    } catch {
      console.error(`Invalid URL format: ${url}`);
      return null;
    }

    console.log(`[getWebsiteInsights] Scraping website: ${baseUrl}`);

    // Try to find additional e-commerce pages (with fallback to single page)
    let pagesToScrape: string[] = [baseUrl];
    try {
      console.log('Looking for additional product pages...');
      pagesToScrape = await scrapeMultiplePages(baseUrl);
      console.log(`Found ${pagesToScrape.length} pages to scrape: ${pagesToScrape.join(', ')}`);
    } catch (error) {
      console.error('Multi-page discovery failed, falling back to homepage only:', error);
      pagesToScrape = [baseUrl];
    }

    // Scrape all pages and combine content
    let combinedContent = '';
    let combinedHtml = '';
    let finalUrl = baseUrl;

    for (const pageUrl of pagesToScrape) {
      try {
        console.log(`Scraping page: ${pageUrl}`);
        const result = await scrapeWebsite(pageUrl);
        combinedContent += `\n\n--- Content from ${pageUrl} ---\n\n${result.textContent}`;
        combinedHtml += result.html;
        if (pageUrl === baseUrl) {
          finalUrl = result.finalUrl;
        }
      } catch (error) {
        console.error(`Failed to scrape ${pageUrl}:`, error);
        // Continue with other pages
      }
    }

    // If we got no content at all, return null
    if (!combinedContent.trim()) {
      console.error('Failed to extract any content from website');
      return null;
    }

    // Limit total content to avoid API limits (50k chars max)
    const maxContentLength = 50000;
    if (combinedContent.length > maxContentLength) {
      console.log(`Content too long (${combinedContent.length} chars), truncating to ${maxContentLength}`);
      combinedContent = combinedContent.slice(0, maxContentLength);
    }

    console.log(`Extracted ${combinedContent.length} total characters from ${pagesToScrape.length} page(s)`);

    // Extract text-based insights from combined content
    const insights = await extractWebsiteInsights(combinedContent);
    console.log('Website text insights extracted successfully');

    // Extract brand colors from CSS (with fallback)
    try {
      const cssColors = extractColorsFromHtml(combinedHtml);
      insights.brandColors = cssColors;
      console.log(`Extracted ${cssColors.length} brand colors from CSS: ${cssColors.join(', ')}`);
    } catch (error) {
      console.error('Failed to extract CSS colors:', error);
      insights.brandColors = [];
    }

    // Extract image URLs from HTML
    const imageUrls = extractImageUrls(combinedHtml, finalUrl);
    console.log(`Found ${imageUrls.length} potential product images`);
    insights.productImageUrls = imageUrls;

    // Try to analyze visual style from first available images (analyze up to 2 to save time)
    if (imageUrls.length > 0) {
      console.log('[getWebsiteInsights] Analyzing visual style from website images...');
      for (const imageUrl of imageUrls.slice(0, 2)) {
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
