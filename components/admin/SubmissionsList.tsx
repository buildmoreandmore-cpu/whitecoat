'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  generating: { bg: 'bg-purple-100', text: 'text-purple-700' },
  generated: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  in_progress: { bg: 'bg-amber-100', text: 'text-amber-700' },
  sent: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
}

const statusLabels: Record<string, string> = {
  new: 'New',
  generating: 'Generating',
  generated: 'Brief Ready',
  in_progress: 'In Progress',
  sent: 'Sent',
}

export default function SubmissionsList({ submissions }: SubmissionsListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      setShowDeleteConfirm(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Failed to delete submission. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

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
            <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">
              Actions
            </th>
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
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/submissions/${submission.id}`}
                      className="text-secondary hover:text-emerald-700 font-medium text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => setShowDeleteConfirm(submission.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete submission"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Delete Submission</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this submission? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deletingId !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deletingId === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
