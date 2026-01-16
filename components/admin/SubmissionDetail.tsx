'use client'

import { useState } from 'react'
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
  const [currentSubmission, setCurrentSubmission] = useState(submission)
  const status = statusColors[currentSubmission.status] || statusColors.new

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
    { label: 'Brand Name', value: currentSubmission.brandName },
    { label: 'Founder Name', value: currentSubmission.founderName },
    { label: 'Email', value: currentSubmission.email },
    { label: 'Website', value: currentSubmission.website || '—' },
    { label: 'Medical Credentials', value: currentSubmission.medicalCredentials },
    { label: 'Specialty', value: currentSubmission.specialty },
    { label: 'Product Type', value: currentSubmission.productType },
    { label: 'Current Revenue', value: currentSubmission.currentRevenue },
    { label: 'Biggest Challenge', value: currentSubmission.biggestChallenge, multiline: true },
    { label: 'Target Audience', value: currentSubmission.targetAudience, multiline: true },
    { label: 'Timeline', value: currentSubmission.timeline },
    { label: 'How Did You Hear', value: currentSubmission.howDidYouHear },
    { label: 'Additional Info', value: currentSubmission.additionalInfo || '—', multiline: true },
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
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.bg} ${status.text} ${status.border}`}
            >
              {statusLabels[currentSubmission.status] || currentSubmission.status}
            </span>
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
                <div key={field.label}>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    {field.label}
                  </label>
                  {field.multiline ? (
                    <p className="text-slate-900 whitespace-pre-wrap">{field.value}</p>
                  ) : (
                    <p className="text-slate-900">{field.value}</p>
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
    </div>
  )
}
