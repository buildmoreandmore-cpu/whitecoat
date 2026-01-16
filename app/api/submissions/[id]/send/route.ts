import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { sendBriefEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
  })

  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  if (!submission.pdfUrl) {
    return NextResponse.json({ error: 'No PDF uploaded yet' }, { status: 400 })
  }

  try {
    await sendBriefEmail({
      to: submission.email,
      founderName: submission.founderName,
      brandName: submission.brandName,
      pdfUrl: submission.pdfUrl,
    })

    // Update submission status
    await prisma.submission.update({
      where: { id: params.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
