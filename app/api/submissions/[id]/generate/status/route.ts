import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
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
      select: {
        id: true,
        status: true,
        briefHtml: true,
        briefGeneratedAt: true,
        adConcepts: true,
        generatedImages: {
          select: {
            id: true,
            adNumber: true,
            imageNumber: true,
            imageUrl: true,
          },
          orderBy: [
            { adNumber: 'asc' },
            { imageNumber: 'asc' },
          ],
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Calculate progress
    const totalExpectedImages = 30; // 10 concepts * 3 images each
    const completedImages = submission.generatedImages.length;
    const progress = Math.round((completedImages / totalExpectedImages) * 100);

    // Parse ad concepts if available
    let conceptsCount = 0;
    if (submission.adConcepts) {
      try {
        const concepts = JSON.parse(submission.adConcepts);
        conceptsCount = Array.isArray(concepts) ? concepts.length : 0;
      } catch {
        // Ignore parse errors
      }
    }

    return NextResponse.json({
      id: submission.id,
      status: submission.status,
      hasBrief: !!submission.briefHtml,
      briefGeneratedAt: submission.briefGeneratedAt,
      conceptsCount,
      imagesCompleted: completedImages,
      imagesTotal: totalExpectedImages,
      progress,
      images: submission.generatedImages,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to get generation status' },
      { status: 500 }
    );
  }
}
