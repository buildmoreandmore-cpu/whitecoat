import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

// GET single submission
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: {
      generatedImages: {
        orderBy: [
          { adNumber: 'asc' },
          { imageNumber: 'asc' },
        ],
      },
    },
  })

  if (!submission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(submission)
}

// PATCH update submission fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Build update data object with only provided fields
  const updateData: Record<string, unknown> = {}

  const allowedFields = [
    'brandName',
    'founderName',
    'email',
    'website',
    'medicalCredentials',
    'specialty',
    'productType',
    'currentRevenue',
    'biggestChallenge',
    'targetAudience',
    'timeline',
    'howDidYouHear',
    'additionalInfo',
    'status',
    'pdfUrl',
    'sentAt',
  ]

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field]
    }
  }

  const submission = await prisma.submission.update({
    where: { id: params.id },
    data: updateData,
    include: {
      generatedImages: {
        orderBy: [
          { adNumber: 'asc' },
          { imageNumber: 'asc' },
        ],
      },
    },
  })

  return NextResponse.json(submission)
}

// DELETE submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete related generated images first
  await prisma.generatedImage.deleteMany({
    where: { submissionId: params.id },
  })

  // Delete the submission
  await prisma.submission.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
