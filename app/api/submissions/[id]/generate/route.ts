import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateAdConcepts, AdConcept } from '@/lib/claude';
import { generateImagesParallel, ImageGenerationResult } from '@/lib/image-generator';
import { generateAllImagePrompts, compileBriefHtml } from '@/lib/brief-generator';
import { getWebsiteInsights, WebsiteInsights } from '@/lib/website-scraper';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        generatedImages: true,
        productPhotos: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Update status to generating
    await prisma.submission.update({
      where: { id: params.id },
      data: { status: 'generating' },
    });

    // Delete any existing generated images for regeneration
    if (submission.generatedImages.length > 0) {
      await prisma.generatedImage.deleteMany({
        where: { submissionId: params.id },
      });
    }

    // Step 0: Scrape website for insights (if URL provided)
    let websiteInsights: WebsiteInsights | null = null;
    if (submission.website) {
      console.log('Analyzing website for insights...');
      try {
        websiteInsights = await getWebsiteInsights(submission.website);
        if (websiteInsights) {
          console.log('Website insights extracted:', {
            products: websiteInsights.products.length,
            structuredProducts: websiteInsights.structuredProducts?.length || 0,
            brandColors: websiteInsights.brandColors?.length || 0,
            hasMessaging: !!websiteInsights.brandMessaging,
            usps: websiteInsights.uniqueSellingPoints.length,
            certifications: websiteInsights.certifications?.length || 0,
          });
        }
      } catch (error) {
        console.error('Website analysis failed (continuing without):', error);
        // Continue without website insights - not a fatal error
      }
    }

    // Step 1: Generate 10 ad concepts using Claude
    console.log('Generating ad concepts...');
    let concepts: AdConcept[];
    try {
      concepts = await generateAdConcepts({
        brandName: submission.brandName,
        founderName: submission.founderName,
        medicalCredentials: submission.medicalCredentials,
        specialty: submission.specialty,
        productType: submission.productType,
        currentRevenue: submission.currentRevenue,
        biggestChallenge: submission.biggestChallenge,
        targetAudience: submission.targetAudience,
        website: submission.website,
        additionalInfo: submission.additionalInfo,
        websiteInsights,
      });
    } catch (error) {
      console.error('Failed to generate ad concepts:', error);
      await prisma.submission.update({
        where: { id: params.id },
        data: { status: 'new' },
      });
      return NextResponse.json(
        { error: `Failed to generate ad concepts: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Store the ad concepts in the submission
    await prisma.submission.update({
      where: { id: params.id },
      data: { adConcepts: JSON.stringify(concepts) },
    });

    // Step 2: Generate image prompts for all concepts (with visual style, colors, and product names if available)
    console.log('[generate] Step 2: Generating image prompts...');
    const productNames = websiteInsights?.structuredProducts?.map(p => p.name) || websiteInsights?.products || [];
    console.log('[generate] Product names for prompts:', productNames.slice(0, 5));
    console.log('[generate] Brand colors for prompts:', websiteInsights?.brandColors?.slice(0, 5) || []);

    let imagePrompts;
    try {
      imagePrompts = generateAllImagePrompts(concepts, submission.brandName, {
        visualStyle: websiteInsights?.visualStyle,
        brandColors: websiteInsights?.brandColors || [],
        productNames,
      });
      console.log('[generate] Generated', imagePrompts.length, 'image prompts');
    } catch (error) {
      console.error('[generate] Failed to generate image prompts:', error);
      throw error;
    }

    // Step 3: Generate images via Gemini (in parallel batches)
    console.log('Generating images via Gemini...');
    let imageResults: ImageGenerationResult[];
    try {
      imageResults = await generateImagesParallel(
        imagePrompts,
        (completed, total, result) => {
          console.log(`Image generation progress: ${completed}/${total}`);
          if (result.error) {
            console.error(`Image generation error for Ad ${result.adNumber}-${result.imageNumber}: ${result.error}`);
          }
        }
      );

      // Log summary of image generation results
      const successCount = imageResults.filter(r => r.imageUrl !== null).length;
      const failCount = imageResults.filter(r => r.error !== null).length;
      console.log(`Image generation complete: ${successCount} succeeded, ${failCount} failed`);

      if (failCount > 0) {
        const sampleErrors = imageResults
          .filter(r => r.error !== null)
          .slice(0, 3)
          .map(r => r.error);
        console.error('Sample image generation errors:', sampleErrors);
      }
    } catch (error) {
      console.error('Failed to generate images:', error);
      // Continue with partial results or no images
      imageResults = [];
    }

    // Step 4: Store generated images in database
    console.log('Storing generated images...');
    const successfulImages = imageResults.filter((r) => r.imageUrl !== null);

    for (const result of successfulImages) {
      await prisma.generatedImage.create({
        data: {
          submissionId: params.id,
          adNumber: result.adNumber,
          imageNumber: result.imageNumber,
          prompt: result.prompt,
          imageUrl: result.imageUrl!,
        },
      });
    }

    // Step 5: Compile HTML brief
    console.log('Compiling HTML brief...');
    const imagesForBrief = successfulImages.map((r) => ({
      adNumber: r.adNumber,
      imageNumber: r.imageNumber,
      prompt: r.prompt,
      imageUrl: r.imageUrl!,
    }));

    const briefHtml = compileBriefHtml(
      {
        id: submission.id,
        brandName: submission.brandName,
        founderName: submission.founderName,
        email: submission.email,
        medicalCredentials: submission.medicalCredentials,
        specialty: submission.specialty,
        productType: submission.productType,
        targetAudience: submission.targetAudience,
        biggestChallenge: submission.biggestChallenge,
        website: submission.website,
        additionalInfo: submission.additionalInfo,
        productPhotos: submission.productPhotos?.map(p => ({
          url: p.url,
          filename: p.filename,
        })) || [],
      },
      concepts,
      imagesForBrief
    );

    // Step 6: Update submission with brief HTML and status
    const updatedSubmission = await prisma.submission.update({
      where: { id: params.id },
      data: {
        briefHtml,
        briefGeneratedAt: new Date(),
        status: 'generated',
      },
      include: { generatedImages: true },
    });

    console.log('Brief generation complete!');

    // Collect sample errors for debugging
    const failedImages = imageResults.filter(r => r.error !== null);
    const sampleErrors = failedImages.slice(0, 3).map(r => r.error);

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      conceptsCount: concepts.length,
      imagesGenerated: successfulImages.length,
      imagesFailed: failedImages.length,
      imageSampleErrors: sampleErrors.length > 0 ? sampleErrors : undefined,
    });
  } catch (error) {
    console.error('Brief generation error:', error);

    // Try to reset status on error
    try {
      await prisma.submission.update({
        where: { id: params.id },
        data: { status: 'new' },
      });
    } catch (e) {
      // Ignore reset errors
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate brief' },
      { status: 500 }
    );
  }
}
