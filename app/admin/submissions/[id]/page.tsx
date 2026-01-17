import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import SubmissionDetail from '@/components/admin/SubmissionDetail'

export default async function SubmissionPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
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
      productPhotos: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!submission) {
    notFound()
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to submissions
        </Link>
      </div>

      <SubmissionDetail submission={submission} />
    </main>
  )
}
