import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
  }

  // Upload to Vercel Blob
  const blob = await put(`briefs/${params.id}/${file.name}`, file, {
    access: 'public',
  })

  // Update submission with PDF URL
  await prisma.submission.update({
    where: { id: params.id },
    data: {
      pdfUrl: blob.url,
      status: 'in_progress',
    },
  })

  return NextResponse.json({ url: blob.url })
}
