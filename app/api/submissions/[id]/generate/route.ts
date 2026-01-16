import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateAdConcepts, AdConcept } from '@/lib/claude';
import { generateImagesParallel, ImageGenerationResult } from '@/lib/glif';
import { generateAllImagePrompts, compileBriefHtml } from '@/lib/brief-generator';

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
      include: { generatedImages: true },
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

    // Step 2: Generate image prompts for all concepts
    console.log('Generating image prompts...');
    const imagePrompts = generateAllImagePrompts(concepts, submission.brandName);

    // Step 3: Generate images via Glif API (in parallel batches)
    console.log('Generating images via Glif API...');
    let imageResults: ImageGenerationResult[];
    try {
      imageResults = await generateImagesParallel(
        imagePrompts,
        (completed, total, result) => {
          console.log(`Image generation progress: ${completed}/${total}`);
        }
      );
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

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      conceptsCount: concepts.length,
      imagesGenerated: successfulImages.length,
      imagesFailed: imageResults.length - successfulImages.length,
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
