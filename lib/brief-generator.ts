import { AdConcept } from './claude';

export interface ImagePrompt {
  prompt: string;
  adNumber: number;
  imageNumber: number;
}

export interface GeneratedImageData {
  adNumber: number;
  imageNumber: number;
  prompt: string;
  imageUrl: string;
}

export function generateImagePrompts(concept: AdConcept, brandName: string): ImagePrompt[] {
  const { adNumber, title, visualAsset, hookType, targetEmotion } = concept;
  const { description, style, keyElements } = visualAsset;

  // Generate 3 variations of the image prompt
  const basePrompt = `Professional healthcare/medical advertising photography. ${description}. Style: ${style}. Brand: ${brandName}.`;

  const prompts: ImagePrompt[] = [
    {
      prompt: `${basePrompt} Key elements: ${keyElements.join(', ')}. Emotion: ${targetEmotion}. Clean, modern, trustworthy aesthetic. High-quality product photography with medical credibility.`,
      adNumber,
      imageNumber: 1,
    },
    {
      prompt: `${basePrompt} Focus on: ${keyElements[0] || 'product'}. ${hookType} appeal. Lifestyle context showing real-world application. Warm, approachable lighting. Professional medical brand imagery.`,
      adNumber,
      imageNumber: 2,
    },
    {
      prompt: `${basePrompt} Emphasizing: ${keyElements.slice(0, 2).join(' and ') || 'brand identity'}. Social media optimized composition. Bold, eye-catching for scroll-stopping. ${targetEmotion} emotion. Healthcare innovation aesthetic.`,
      adNumber,
      imageNumber: 3,
    },
  ];

  return prompts;
}

export function generateAllImagePrompts(concepts: AdConcept[], brandName: string): ImagePrompt[] {
  const allPrompts: ImagePrompt[] = [];

  for (const concept of concepts) {
    const conceptPrompts = generateImagePrompts(concept, brandName);
    allPrompts.push(...conceptPrompts);
  }

  return allPrompts;
}

export interface SubmissionForBrief {
  id: string;
  brandName: string;
  founderName: string;
  email: string;
  medicalCredentials: string;
  specialty: string;
  productType: string;
  targetAudience: string;
  biggestChallenge: string;
  website?: string | null;
}

export function compileBriefHtml(
  submission: SubmissionForBrief,
  concepts: AdConcept[],
  images: GeneratedImageData[]
): string {
  const imagesByAd = new Map<number, GeneratedImageData[]>();
  for (const img of images) {
    const existing = imagesByAd.get(img.adNumber) || [];
    existing.push(img);
    imagesByAd.set(img.adNumber, existing);
  }

  const adSections = concepts.map((concept) => {
    const adImages = imagesByAd.get(concept.adNumber) || [];
    const sortedImages = adImages.sort((a, b) => a.imageNumber - b.imageNumber);

    const imageGallery = sortedImages.length > 0
      ? `<div class="image-gallery">
          ${sortedImages.map((img) => `
            <div class="image-card">
              <img src="${img.imageUrl}" alt="Ad ${concept.adNumber} - Variation ${img.imageNumber}" />
              <span class="image-label">Variation ${img.imageNumber}</span>
            </div>
          `).join('')}
        </div>`
      : '<p class="no-images">Images generating...</p>';

    return `
      <section class="ad-concept">
        <div class="ad-header">
          <span class="ad-number">AD ${String(concept.adNumber).padStart(2, '0')}</span>
          <h2 class="ad-title">${concept.title}</h2>
          <span class="hook-type">${concept.hookType}</span>
        </div>

        ${imageGallery}

        <div class="ad-content">
          <div class="content-row">
            <div class="content-block">
              <h4>Opening Hook</h4>
              <p class="hook-text">"${concept.openingHook}"</p>
            </div>
            <div class="content-block">
              <h4>Target Emotion</h4>
              <p>${concept.targetEmotion}</p>
            </div>
          </div>

          <div class="content-block full-width">
            <h4>Body Script</h4>
            <p>${concept.bodyScript}</p>
          </div>

          <div class="content-row">
            <div class="content-block">
              <h4>Call to Action</h4>
              <p class="cta-text">${concept.callToAction}</p>
            </div>
            <div class="content-block">
              <h4>Platform</h4>
              <p>${concept.platformRecommendation}</p>
            </div>
          </div>

          <div class="content-block full-width visual-spec">
            <h4>Visual Specification</h4>
            <p><strong>Description:</strong> ${concept.visualAsset.description}</p>
            <p><strong>Style:</strong> ${concept.visualAsset.style}</p>
            <p><strong>Key Elements:</strong> ${concept.visualAsset.keyElements.join(', ')}</p>
          </div>
        </div>
      </section>
    `;
  }).join('');

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhiteCoat Brief - ${submission.brandName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      line-height: 1.6;
    }

    .brief-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .brief-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      padding: 60px 40px;
      border-radius: 16px;
      margin-bottom: 40px;
    }

    .brief-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .brief-header .subtitle {
      font-size: 1.25rem;
      color: #94a3b8;
      margin-bottom: 24px;
    }

    .brand-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      padding-top: 24px;
      border-top: 1px solid #334155;
    }

    .brand-info-item {
      display: flex;
      flex-direction: column;
    }

    .brand-info-item label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 4px;
    }

    .brand-info-item span {
      font-size: 1rem;
      color: white;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #059669;
      display: inline-block;
    }

    .ad-concept {
      background: white;
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .ad-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .ad-number {
      background: #059669;
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }

    .ad-title {
      font-size: 1.5rem;
      font-weight: 600;
      flex: 1;
      min-width: 200px;
    }

    .hook-type {
      background: #f1f5f9;
      color: #475569;
      font-size: 0.875rem;
      padding: 6px 12px;
      border-radius: 6px;
    }

    .image-gallery {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .image-card {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      background: #f1f5f9;
      aspect-ratio: 1;
    }

    .image-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-label {
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 0.75rem;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .no-images {
      color: #94a3b8;
      font-style: italic;
      padding: 40px;
      text-align: center;
      background: #f8fafc;
      border-radius: 12px;
      grid-column: 1 / -1;
    }

    .ad-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .content-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .content-block {
      background: #f8fafc;
      padding: 20px;
      border-radius: 12px;
    }

    .content-block.full-width {
      grid-column: 1 / -1;
    }

    .content-block h4 {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 8px;
    }

    .content-block p {
      color: #334155;
    }

    .hook-text {
      font-size: 1.125rem;
      font-weight: 500;
      color: #0f172a !important;
      font-style: italic;
    }

    .cta-text {
      font-weight: 600;
      color: #059669 !important;
    }

    .visual-spec p {
      margin-bottom: 8px;
    }

    .visual-spec p:last-child {
      margin-bottom: 0;
    }

    .brief-footer {
      text-align: center;
      padding: 40px;
      color: #64748b;
      font-size: 0.875rem;
    }

    .brief-footer .logo {
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }

    @media (max-width: 768px) {
      .brief-header {
        padding: 40px 24px;
      }

      .brief-header h1 {
        font-size: 1.75rem;
      }

      .image-gallery {
        grid-template-columns: 1fr;
      }

      .content-row {
        grid-template-columns: 1fr;
      }

      .ad-concept {
        padding: 24px;
      }
    }

    @media print {
      body {
        background: white;
      }

      .brief-container {
        padding: 0;
      }

      .ad-concept {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="brief-container">
    <header class="brief-header">
      <h1>WhiteCoat Brief</h1>
      <p class="subtitle">DTC Intelligence Brief for ${submission.brandName}</p>

      <div class="brand-info">
        <div class="brand-info-item">
          <label>Founder</label>
          <span>${submission.founderName}</span>
        </div>
        <div class="brand-info-item">
          <label>Credentials</label>
          <span>${submission.medicalCredentials}</span>
        </div>
        <div class="brand-info-item">
          <label>Specialty</label>
          <span>${submission.specialty}</span>
        </div>
        <div class="brand-info-item">
          <label>Product Type</label>
          <span>${submission.productType}</span>
        </div>
        <div class="brand-info-item">
          <label>Target Audience</label>
          <span>${submission.targetAudience}</span>
        </div>
        <div class="brand-info-item">
          <label>Generated</label>
          <span>${currentDate}</span>
        </div>
      </div>
    </header>

    <main>
      <h2 class="section-title">Ad Concepts (${concepts.length})</h2>
      ${adSections}
    </main>

    <footer class="brief-footer">
      <p class="logo">WhiteCoat Brief</p>
      <p>Generated on ${currentDate}</p>
      <p>This brief contains AI-generated content and images for creative direction purposes.</p>
    </footer>
  </div>
</body>
</html>`;
}
