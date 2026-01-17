import { GoogleGenAI } from '@google/genai';
import { WebsiteInsights, VisualStyle } from './website-scraper';

export interface AdConcept {
  adNumber: number;
  title: string;
  hookType: string;
  openingHook: string;
  visualAsset: {
    description: string;
    style: string;
    keyElements: string[];
  };
  bodyScript: string;
  callToAction: string;
  targetEmotion: string;
  platformRecommendation: string;
}

export interface SubmissionData {
  brandName: string;
  founderName: string;
  medicalCredentials: string;
  specialty: string;
  productType: string;
  currentRevenue: string;
  biggestChallenge: string;
  targetAudience: string;
  website?: string | null;
  additionalInfo?: string | null;
  websiteInsights?: WebsiteInsights | null;
}

const DTC_INTELLIGENCE_BRIEF_SYSTEM_PROMPT = `You are an expert DTC (Direct-to-Consumer) advertising strategist specializing in healthcare and medical brands. Your task is to create compelling ad concepts that leverage the founder's medical credibility while adhering to advertising best practices.

Your output must be valid JSON following this exact structure:
{
  "adConcepts": [
    {
      "adNumber": 1,
      "title": "Ad concept title (e.g., 'The Post-It Reveal')",
      "hookType": "Type of hook (e.g., 'Authority', 'Curiosity', 'Problem-Solution', 'Social Proof', 'Urgency')",
      "openingHook": "The first 3 seconds hook text - this is crucial for stopping the scroll",
      "visualAsset": {
        "description": "Detailed description of the visual - what should the image show?",
        "style": "Photography style (e.g., 'Professional medical setting', 'Lifestyle', 'Before/After', 'Product hero shot')",
        "keyElements": ["Element 1", "Element 2", "Element 3"]
      },
      "bodyScript": "The main body copy/script for the ad (2-3 sentences)",
      "callToAction": "Clear CTA text",
      "targetEmotion": "Primary emotion to evoke (e.g., 'Trust', 'Hope', 'Relief', 'Curiosity')",
      "platformRecommendation": "Best platform for this ad (e.g., 'Meta (Facebook/Instagram)', 'TikTok', 'YouTube')"
    }
  ]
}

Key principles for DTC medical/health ads:
1. Lead with credibility - the founder's medical credentials are a major differentiator
2. Use authority hooks - "As a [specialty], I see X every day..."
3. Address pain points directly - be specific about the problem
4. Avoid medical claims that could trigger ad rejection
5. Focus on the transformation/benefit, not just features
6. Use social proof strategically
7. Keep hooks under 3 seconds for social media
8. CTA should be clear and low-commitment ("Learn more", "Shop now", "See how")

Generate 10 diverse ad concepts that:
- Use different hook types (Authority, Curiosity, Problem-Solution, Social Proof, Urgency, Story)
- Target different stages of the customer journey
- Suit different platforms (Meta, TikTok, YouTube)
- Leverage the founder's medical credentials authentically
- Address the brand's specific challenges and target audience`;

export async function generateAdConcepts(submission: SubmissionData): Promise<AdConcept[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Build website insights section if available
  let websiteSection = '';
  let visualStyleSection = '';
  let productsSection = '';
  if (submission.websiteInsights) {
    const insights = submission.websiteInsights;

    // Build detailed products section if structured products are available
    if (insights.structuredProducts && insights.structuredProducts.length > 0) {
      const productDetails = insights.structuredProducts.map(p =>
        `  - ${p.name}${p.price ? ` (${p.price})` : ''}${p.description ? `: ${p.description}` : ''}${p.category ? ` [${p.category}]` : ''}`
      ).join('\n');
      productsSection = `
**Product Catalog (IMPORTANT - use these exact product names in ads):**
${productDetails}
`;
    }

    websiteSection = `
**Website Analysis:**
- Products/Services: ${insights.products.length > 0 ? insights.products.join(', ') : 'Not found'}
- Pricing: ${insights.pricing}
- Brand Messaging: ${insights.brandMessaging}
- Unique Selling Points: ${insights.uniqueSellingPoints.length > 0 ? insights.uniqueSellingPoints.join(', ') : 'Not found'}
- Key Benefits: ${insights.keyBenefits.length > 0 ? insights.keyBenefits.join(', ') : 'Not found'}
${insights.certifications && insights.certifications.length > 0 ? `- Certifications/Trust Badges: ${insights.certifications.join(', ')}` : ''}
${insights.testimonials.length > 0 ? `- Customer Testimonials: ${insights.testimonials.slice(0, 3).join(' | ')}` : ''}
${productsSection}`;

    // Add visual style if available
    const brandColors = insights.brandColors && insights.brandColors.length > 0
      ? insights.brandColors.join(', ')
      : null;

    if (insights.visualStyle || brandColors) {
      const vs = insights.visualStyle;
      visualStyleSection = `
**Brand Visual Style (from website):**
${brandColors ? `- Brand Colors (from CSS): ${brandColors}` : ''}
${vs ? `- Color Palette (from images): ${vs.colorPalette.join(', ')}` : ''}
${vs ? `- Photography Style: ${vs.photographyStyle}` : ''}
${vs ? `- Overall Aesthetic: ${vs.overallAesthetic}` : ''}
${vs ? `- Brand Mood: ${vs.brandMood}` : ''}

IMPORTANT: When describing visual assets, match this brand's existing visual style. Use their color palette, photography style, and aesthetic.
`;
    }
  }

  const userPrompt = `Create 10 DTC ad concepts for the following brand:

**Brand Name:** ${submission.brandName}
**Founder:** ${submission.founderName}
**Medical Credentials:** ${submission.medicalCredentials}
**Specialty:** ${submission.specialty}
**Product Type:** ${submission.productType}
**Current Revenue:** ${submission.currentRevenue}
**Biggest Challenge:** ${submission.biggestChallenge}
**Target Audience:** ${submission.targetAudience}
${submission.website ? `**Website:** ${submission.website}` : ''}
${submission.additionalInfo ? `**Additional Info:** ${submission.additionalInfo}` : ''}
${websiteSection}${visualStyleSection}
Generate 10 unique ad concepts that:
1. Leverage ${submission.founderName}'s ${submission.medicalCredentials} credentials
2. Address the challenge: "${submission.biggestChallenge}"
3. Resonate with the target audience: "${submission.targetAudience}"
4. Are appropriate for ${submission.productType} products
5. Use a variety of hook types and platforms
${submission.websiteInsights ? '6. Incorporate specific products, benefits, and messaging from the website analysis above' : ''}

Return ONLY valid JSON, no markdown formatting or code blocks.`;

  console.log('[generateAdConcepts] Calling Gemini API...');
  console.log('[generateAdConcepts] Prompt length:', (DTC_INTELLIGENCE_BRIEF_SYSTEM_PROMPT + '\n\n' + userPrompt).length);

  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: DTC_INTELLIGENCE_BRIEF_SYSTEM_PROMPT + '\n\n' + userPrompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 8000,
      },
    });
    console.log('[generateAdConcepts] Gemini API response received');
  } catch (error) {
    console.error('[generateAdConcepts] Gemini API call failed:', error);
    console.error('[generateAdConcepts] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[generateAdConcepts] Error message:', error instanceof Error ? error.message : String(error));
    throw error;
  }

  let jsonText = response.text?.trim() || '';
  console.log('[generateAdConcepts] Response length:', jsonText.length);
  console.log('[generateAdConcepts] Response preview:', jsonText.slice(0, 200) + '...');

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
    if (!parsed.adConcepts || !Array.isArray(parsed.adConcepts)) {
      console.error('[generateAdConcepts] Invalid structure - adConcepts missing or not array');
      throw new Error('Invalid response structure: missing adConcepts array');
    }
    console.log('[generateAdConcepts] Successfully parsed', parsed.adConcepts.length, 'ad concepts');
    return parsed.adConcepts as AdConcept[];
  } catch (error) {
    console.error('[generateAdConcepts] Failed to parse JSON:', error);
    console.error('[generateAdConcepts] Raw response:', jsonText.slice(0, 500));
    throw new Error(`Failed to parse ad concepts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
