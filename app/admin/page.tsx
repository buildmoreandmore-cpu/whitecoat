import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import SubmissionsList from '@/components/admin/SubmissionsList'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-primary">
          Submissions
        </h1>
        <p className="text-slate-500 mt-1">
          View and manage questionnaire submissions
        </p>
      </div>

      <SubmissionsList submissions={submissions} />
    </main>
  )
}
