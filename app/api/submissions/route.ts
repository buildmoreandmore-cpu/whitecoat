import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

// GET all submissions (admin only)
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      brandName: true,
      founderName: true,
      email: true,
      status: true,
      createdAt: true,
    },
  })

  return NextResponse.json(submissions)
}

// POST new submission (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const submission = await prisma.submission.create({
      data: {
        brandName: body.brandName,
        founderName: body.founderName,
        email: body.email,
        website: body.website || null,
        medicalCredentials: body.medicalCredentials,
        specialty: body.specialty,
        productType: body.productType,
        currentRevenue: body.currentRevenue,
        biggestChallenge: body.biggestChallenge,
        targetAudience: body.targetAudience,
        timeline: body.timeline || 'Not specified',
        howDidYouHear: body.howDidYouHear || 'Not specified',
        additionalInfo: body.additionalInfo || null,
      },
    })

    return NextResponse.json({ id: submission.id }, { status: 201 })
  } catch (error) {
    console.error('Failed to create submission:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}
