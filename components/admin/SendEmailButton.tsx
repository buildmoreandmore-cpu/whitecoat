'use client'

import { useState } from 'react'

interface SendEmailButtonProps {
  submissionId: string
  disabled: boolean
  onSent: () => void
}

export default function SendEmailButton({
  submissionId,
  disabled,
  onSent,
}: SendEmailButtonProps) {
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    setIsSending(true)
    setError(null)

    try {
      const response = await fetch(`/api/submissions/${submissionId}/send`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send email')
      }

      onSent()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleSend}
        disabled={disabled || isSending}
        className={`w-full py-3 rounded-lg font-bold transition-colors ${
          disabled
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-secondary text-white hover:bg-emerald-700'
        }`}
      >
        {isSending ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Send Email
          </span>
        )}
      </button>

      {disabled && !isSending && (
        <p className="text-xs text-slate-400 text-center mt-2">
          Upload a PDF first to enable sending
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 text-center mt-3">{error}</p>
      )}
    </div>
  )
}
