'use client'

import Link from 'next/link'

interface Submission {
  id: string
  brandName: string
  founderName: string
  email: string
  status: string
  createdAt: Date
}

interface SubmissionsListProps {
  submissions: Submission[]
}

const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700' },
  in_progress: { bg: 'bg-amber-100', text: 'text-amber-700' },
  sent: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
}

const statusLabels: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  sent: 'Sent',
}

export default function SubmissionsList({ submissions }: SubmissionsListProps) {
  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-1">
          No submissions yet
        </h3>
        <p className="text-slate-500">
          Questionnaire submissions will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
              Brand
            </th>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
              Founder
            </th>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
              Email
            </th>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
              Status
            </th>
            <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
              Date
            </th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {submissions.map((submission) => {
            const status = statusColors[submission.status] || statusColors.new
            return (
              <tr
                key={submission.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900">
                    {submission.brandName}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {submission.founderName}
                </td>
                <td className="px-6 py-4 text-slate-600">{submission.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                  >
                    {statusLabels[submission.status] || submission.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  {new Date(submission.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/submissions/${submission.id}`}
                    className="text-secondary hover:text-emerald-700 font-medium text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
