'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PDFUploader from './PDFUploader'
import SendEmailButton from './SendEmailButton'
import BriefGenerator from './BriefGenerator'

interface GeneratedImage {
  id: string
  adNumber: number
  imageNumber: number
  imageUrl: string
}

interface Submission {
  id: string
  brandName: string
  founderName: string
  email: string
  website: string | null
  medicalCredentials: string
  specialty: string
  productType: string
  currentRevenue: string
  biggestChallenge: string
  targetAudience: string
  timeline: string
  howDidYouHear: string
  additionalInfo: string | null
  status: string
  pdfUrl: string | null
  sentAt: Date | null
  createdAt: Date
  briefHtml: string | null
  briefGeneratedAt: Date | null
  adConcepts: string | null
  generatedImages: GeneratedImage[]
}

interface SubmissionDetailProps {
  submission: Submission
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  generating: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  generated: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  sent: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
}

const statusLabels: Record<string, string> = {
  new: 'New',
  generating: 'Generating Brief',
  generated: 'Brief Ready',
  in_progress: 'In Progress',
  sent: 'Sent',
}

export default function SubmissionDetail({ submission }: SubmissionDetailProps) {
  const router = useRouter()
  const [currentSubmission, setCurrentSubmission] = useState(submission)
  const [isEditing, setIsEditing] = useState(false)
  const [editedFields, setEditedFields] = useState<Partial<Submission>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const status = statusColors[currentSubmission.status] || statusColors.new

  const handleStartEdit = () => {
    setEditedFields({
      brandName: currentSubmission.brandName,
      founderName: currentSubmission.founderName,
      email: currentSubmission.email,
      website: currentSubmission.website,
      medicalCredentials: currentSubmission.medicalCredentials,
      specialty: currentSubmission.specialty,
      productType: currentSubmission.productType,
      currentRevenue: currentSubmission.currentRevenue,
      biggestChallenge: currentSubmission.biggestChallenge,
      targetAudience: currentSubmission.targetAudience,
      timeline: currentSubmission.timeline,
      howDidYouHear: currentSubmission.howDidYouHear,
      additionalInfo: currentSubmission.additionalInfo,
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedFields({})
  }

  const handleFieldChange = (field: string, value: string) => {
    setEditedFields((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/submissions/${currentSubmission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedFields),
      })

      if (!response.ok) throw new Error('Failed to save')

      const updated = await response.json()
      setCurrentSubmission(updated)
      setIsEditing(false)
      setEditedFields({})
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/submissions/${currentSubmission.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      router.push('/admin')
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Failed to delete submission. Please try again.')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handlePdfUploaded = (url: string) => {
    setCurrentSubmission((prev) => ({
      ...prev,
      pdfUrl: url,
      status: 'in_progress',
    }))
  }

  const handleEmailSent = () => {
    setCurrentSubmission((prev) => ({
      ...prev,
      status: 'sent',
      sentAt: new Date(),
    }))
  }

  const handleBriefStatusChange = (newStatus: string) => {
    setCurrentSubmission((prev) => ({
      ...prev,
      status: newStatus,
    }))
  }

  const fields = [
    { key: 'brandName', label: 'Brand Name', value: currentSubmission.brandName },
    { key: 'founderName', label: 'Founder Name', value: currentSubmission.founderName },
    { key: 'email', label: 'Email', value: currentSubmission.email },
    { key: 'website', label: 'Website', value: currentSubmission.website || '' },
    { key: 'medicalCredentials', label: 'Medical Credentials', value: currentSubmission.medicalCredentials },
    { key: 'specialty', label: 'Specialty', value: currentSubmission.specialty },
    { key: 'productType', label: 'Product Type', value: currentSubmission.productType },
    { key: 'currentRevenue', label: 'Current Revenue', value: currentSubmission.currentRevenue },
    { key: 'biggestChallenge', label: 'Biggest Challenge', value: currentSubmission.biggestChallenge, multiline: true },
    { key: 'targetAudience', label: 'Target Audience', value: currentSubmission.targetAudience, multiline: true },
    { key: 'timeline', label: 'Timeline', value: currentSubmission.timeline },
    { key: 'howDidYouHear', label: 'How Did You Hear', value: currentSubmission.howDidYouHear },
    { key: 'additionalInfo', label: 'Additional Info', value: currentSubmission.additionalInfo || '', multiline: true },
  ]

  const copyAllToClipboard = () => {
    const text = fields
      .map((f) => `${f.label}:\n${f.value}`)
      .join('\n\n')
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Questionnaire Answers */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {currentSubmission.brandName}
              </h2>
              <p className="text-sm text-slate-500">
                Submitted{' '}
                {new Date(currentSubmission.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.bg} ${status.text} ${status.border}`}
              >
                {statusLabels[currentSubmission.status] || currentSubmission.status}
              </span>
              {!isEditing ? (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-end mb-4">
              <button
                onClick={copyAllToClipboard}
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy All
              </button>
            </div>

            <div className="space-y-6">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    {field.label}
                  </label>
                  {isEditing ? (
                    field.multiline ? (
                      <textarea
                        value={(editedFields[field.key as keyof Submission] as string) ?? ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                      />
                    ) : (
                      <input
                        type={field.key === 'email' ? 'email' : 'text'}
                        value={(editedFields[field.key as keyof Submission] as string) ?? ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                      />
                    )
                  ) : field.multiline ? (
                    <p className="text-slate-900 whitespace-pre-wrap">{field.value || '—'}</p>
                  ) : (
                    <p className="text-slate-900">{field.value || '—'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Actions Panel */}
      <div className="space-y-6">
        {/* AI Brief Generator */}
        <BriefGenerator
          submissionId={currentSubmission.id}
          brandName={currentSubmission.brandName}
          initialStatus={currentSubmission.status}
          initialBriefHtml={currentSubmission.briefHtml}
          initialAdConcepts={currentSubmission.adConcepts}
          initialImages={currentSubmission.generatedImages || []}
          onStatusChange={handleBriefStatusChange}
        />

        {/* PDF Upload */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            WhiteCoat Brief PDF
          </h3>
          <PDFUploader
            submissionId={currentSubmission.id}
            currentPdfUrl={currentSubmission.pdfUrl}
            onUpload={handlePdfUploaded}
          />
        </div>

        {/* Send Email */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Send to Client
          </h3>
          {currentSubmission.sentAt ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium">Email sent</span>
              </div>
              <p className="text-sm text-emerald-600 mt-1">
                Sent on{' '}
                {new Date(currentSubmission.sentAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4">
                Send the WhiteCoat Brief to {currentSubmission.founderName} at{' '}
                <span className="font-medium text-slate-700">
                  {currentSubmission.email}
                </span>
              </p>
              <SendEmailButton
                submissionId={currentSubmission.id}
                disabled={!currentSubmission.pdfUrl}
                onSent={handleEmailSent}
              />
            </>
          )}
        </div>
      </div>

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
              Are you sure you want to delete the submission from <strong>{currentSubmission.brandName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
