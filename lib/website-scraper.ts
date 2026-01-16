import { GoogleGenAI } from '@google/genai';

export interface WebsiteInsights {
  products: string[];
  pricing: string;
  brandMessaging: string;
  uniqueSellingPoints: string[];
  targetAudience: string;
  testimonials: string[];
  keyBenefits: string[];
  rawContent: string;
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

export async function scrapeWebsite(url: string): Promise<string> {
  try {
    // Ensure URL has protocol
    let fetchUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fetchUrl = `https://${url}`;
    }

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WhiteCoatBrief/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }

    const html = await response.text();

    // Extract text content from HTML (basic extraction)
    const textContent = extractTextFromHtml(html);

    // Limit content to avoid token limits
    const truncatedContent = textContent.slice(0, 15000);

    return truncatedContent;
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
    const content = await scrapeWebsite(url);
    console.log(`Extracted ${content.length} characters from website`);

    const insights = await extractWebsiteInsights(content);
    console.log('Website insights extracted successfully');

    return insights;
  } catch (error) {
    console.error('Failed to get website insights:', error);
    return null;
  }
}
