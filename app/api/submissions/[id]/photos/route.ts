import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { put, del } from '@vercel/blob'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

// GET - List all product photos for a submission
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const photos = await prisma.productPhoto.findMany({
    where: { submissionId: params.id },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(photos)
}

// POST - Upload a new product photo
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

  // Validate file type (images only)
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only image files (JPEG, PNG, WebP, GIF) are allowed' },
      { status: 400 }
    )
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: 'File size must be less than 10MB' },
      { status: 400 }
    )
  }

  // Upload to Vercel Blob
  const blob = await put(`product-photos/${params.id}/${file.name}`, file, {
    access: 'public',
  })

  // Save to database
  const photo = await prisma.productPhoto.create({
    data: {
      submissionId: params.id,
      url: blob.url,
      filename: file.name,
    },
  })

  return NextResponse.json(photo)
}

// DELETE - Delete a product photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const photoId = searchParams.get('photoId')

  if (!photoId) {
    return NextResponse.json({ error: 'Photo ID required' }, { status: 400 })
  }

  // Find the photo
  const photo = await prisma.productPhoto.findUnique({
    where: { id: photoId },
  })

  if (!photo || photo.submissionId !== params.id) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  }

  // Delete from Vercel Blob
  try {
    await del(photo.url)
  } catch (error) {
    console.error('Failed to delete blob:', error)
    // Continue with database deletion even if blob deletion fails
  }

  // Delete from database
  await prisma.productPhoto.delete({
    where: { id: photoId },
  })

  return NextResponse.json({ success: true })
}
