'use client'

import { useState, useEffect, useCallback } from 'react'
import ImageGallery from './ImageGallery'
import BriefPreview from './BriefPreview'

interface GeneratedImage {
  id: string
  adNumber: number
  imageNumber: number
  imageUrl: string
}

interface AdConcept {
  adNumber: number
  title: string
  hookType: string
  openingHook: string
  visualAsset: {
    description: string
    style: string
    keyElements: string[]
  }
  bodyScript: string
  callToAction: string
  targetEmotion: string
  platformRecommendation: string
}

interface GenerationStatus {
  status: string
  hasBrief: boolean
  briefGeneratedAt: string | null
  conceptsCount: number
  imagesCompleted: number
  imagesTotal: number
  progress: number
  images: GeneratedImage[]
}

interface BriefGeneratorProps {
  submissionId: string
  brandName: string
  initialStatus: string
  initialBriefHtml: string | null
  initialAdConcepts: string | null
  initialImages: GeneratedImage[]
  onStatusChange: (status: string) => void
}

export default function BriefGenerator({
  submissionId,
  brandName,
  initialStatus,
  initialBriefHtml,
  initialAdConcepts,
  initialImages,
  onStatusChange,
}: BriefGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(initialStatus === 'generating')
  const [status, setStatus] = useState<GenerationStatus | null>(null)
  const [briefHtml, setBriefHtml] = useState<string | null>(initialBriefHtml)
  const [concepts, setConcepts] = useState<AdConcept[]>(() => {
    if (initialAdConcepts) {
      try {
        return JSON.parse(initialAdConcepts)
      } catch {
        return []
      }
    }
    return []
  })
  const [images, setImages] = useState<GeneratedImage[]>(initialImages)
  const [error, setError] = useState<string | null>(null)
  const [showGallery, setShowGallery] = useState(false)

  // Fetch status while generating
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/submissions/${submissionId}/generate/status`)
      if (res.ok) {
        const data: GenerationStatus = await res.json()
        setStatus(data)
        setImages(data.images)

        if (data.status !== 'generating') {
          setIsGenerating(false)
          onStatusChange(data.status)
        }
      }
    } catch (err) {
      console.error('Failed to fetch status:', err)
    }
  }, [submissionId, onStatusChange])

  // Poll for status during generation
  useEffect(() => {
    if (!isGenerating) return

    const interval = setInterval(fetchStatus, 2000)
    return () => clearInterval(interval)
  }, [isGenerating, fetchStatus])

  // Initial status fetch if generating
  useEffect(() => {
    if (initialStatus === 'generating') {
      fetchStatus()
    }
  }, [initialStatus, fetchStatus])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    onStatusChange('generating')

    try {
      const res = await fetch(`/api/submissions/${submissionId}/generate`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate brief')
      }

      setBriefHtml(data.submission.briefHtml)
      setImages(data.submission.generatedImages || [])

      if (data.submission.adConcepts) {
        try {
          setConcepts(JSON.parse(data.submission.adConcepts))
        } catch {
          // Ignore parse errors
        }
      }

      onStatusChange('generated')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      onStatusChange('new')
    } finally {
      setIsGenerating(false)
    }
  }

  const progress = status?.progress || Math.round((images.length / 30) * 100)
  const hasGenerated = briefHtml || initialStatus === 'generated' || initialStatus === 'in_progress' || initialStatus === 'sent'

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">
          Generate WhiteCoat Brief
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          AI-powered ad concepts and image generation
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Generate/Regenerate Button */}
        {!isGenerating && (
          <button
            onClick={handleGenerate}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              hasGenerated
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            {hasGenerated ? 'Regenerate Brief' : 'Generate Brief'}
          </button>
        )}

        {/* Progress Indicator */}
        {isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {status?.conceptsCount
                  ? `Generating images: ${status.imagesCompleted}/${status.imagesTotal}`
                  : 'Generating ad concepts...'}
              </span>
              <span className="text-emerald-600 font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 text-center">
              This may take a few minutes. Please keep this page open.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Generation Failed</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Brief Preview Actions */}
        {briefHtml && !isGenerating && (
          <div className="space-y-4">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">Brief Generated</span>
              </div>
              <p className="text-sm text-emerald-600 mt-1">
                {concepts.length} ad concepts with {images.length} images
              </p>
            </div>

            <BriefPreview briefHtml={briefHtml} brandName={brandName} />
          </div>
        )}

        {/* Image Gallery Toggle */}
        {images.length > 0 && concepts.length > 0 && !isGenerating && (
          <div>
            <button
              onClick={() => setShowGallery(!showGallery)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-slate-700">
                View All Images ({images.length})
              </span>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${
                  showGallery ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showGallery && (
              <div className="mt-4">
                <ImageGallery images={images} concepts={concepts} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
