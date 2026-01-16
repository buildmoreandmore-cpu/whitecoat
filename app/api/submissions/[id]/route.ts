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

// PATCH update submission status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const submission = await prisma.submission.update({
    where: { id: params.id },
    data: {
      status: body.status,
      pdfUrl: body.pdfUrl,
      sentAt: body.sentAt,
    },
  })

  return NextResponse.json(submission)
}
