'use client'

import { useState } from 'react'

interface QuestionnairePanelProps {
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  brandName: string
  founderName: string
  email: string
  website: string
  medicalCredentials: string
  specialty: string
  productType: string
  currentRevenue: string
  biggestChallenge: string
  targetAudience: string
  timeline: string
  howDidYouHear: string
  additionalInfo: string
}

interface Question {
  id: keyof FormData
  question: string
  subtitle?: string
  type: 'text' | 'email' | 'url' | 'select' | 'textarea'
  placeholder?: string
  options?: string[]
  optional?: boolean
}

const questions: Question[] = [
  {
    id: 'founderName',
    question: "What's your name?",
    type: 'text',
    placeholder: 'Dr. Jane Smith',
  },
  {
    id: 'email',
    question: "What's your email?",
    type: 'email',
    placeholder: 'you@example.com',
  },
  {
    id: 'brandName',
    question: "What's your brand name?",
    type: 'text',
    placeholder: 'e.g., Smith Skincare',
  },
  {
    id: 'medicalCredentials',
    question: 'Your credentials?',
    type: 'select',
    options: ['MD', 'DO', 'PhD', 'PharmD', 'NP/PA', 'RN', 'Other'],
  },
  {
    id: 'specialty',
    question: 'Your specialty?',
    type: 'text',
    placeholder: 'e.g., Dermatology',
  },
  {
    id: 'productType',
    question: 'Product type?',
    type: 'select',
    options: [
      'Skincare',
      'Supplements',
      'Medical Devices',
      'Wellness',
      'Multiple',
    ],
  },
  {
    id: 'currentRevenue',
    question: 'Monthly revenue?',
    type: 'select',
    options: [
      'Pre-launch',
      'Under $50k',
      '$50k-$500k',
      '$500k+',
    ],
  },
  {
    id: 'targetAudience',
    question: 'Who is your ideal customer?',
    type: 'textarea',
    placeholder: 'Age, concerns, lifestyle...',
  },
  {
    id: 'biggestChallenge',
    question: 'Biggest marketing challenge?',
    type: 'textarea',
    placeholder: "What's holding you back?",
  },
]

const initialFormData: FormData = {
  brandName: '',
  founderName: '',
  email: '',
  website: '',
  medicalCredentials: '',
  specialty: '',
  productType: '',
  currentRevenue: '',
  biggestChallenge: '',
  targetAudience: '',
  timeline: '',
  howDidYouHear: '',
  additionalInfo: '',
}

export default function QuestionnairePanel({
  isOpen,
  onClose,
}: QuestionnairePanelProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleInputChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
  }

  const canProceed = () => {
    const value = formData[currentQuestion.id]
    if (currentQuestion.optional) return true
    return value && value.trim() !== ''
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
      e.preventDefault()
      handleNext()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.details || data.error || 'Failed to submit questionnaire')
      }

      setIsComplete(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setCurrentStep(0)
      setFormData(initialFormData)
      setIsComplete(false)
      setError(null)
    }, 300)
  }

  const renderInput = () => {
    const value = formData[currentQuestion.id]

    switch (currentQuestion.type) {
      case 'select':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => {
                  handleInputChange(option)
                  setTimeout(handleNext, 300)
                }}
                className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                  value === option
                    ? 'border-secondary bg-emerald-50 text-secondary'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>
        )
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentQuestion.placeholder}
            rows={4}
            className="w-full px-6 py-4 rounded-xl border-2 border-slate-200 focus:border-secondary focus:ring-0 outline-none transition-colors resize-none text-lg"
            autoFocus
          />
        )
      default:
        return (
          <input
            type={currentQuestion.type}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentQuestion.placeholder}
            className="w-full px-6 py-4 rounded-xl border-2 border-slate-200 focus:border-secondary focus:ring-0 outline-none transition-colors text-lg"
            autoFocus
          />
        )
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <span className="font-mono text-secondary text-xs font-bold tracking-widest">
              WHITECOAT BRIEF
            </span>
            <div className="text-sm text-slate-500 mt-1">
              {isComplete
                ? 'Complete'
                : `Question ${currentStep + 1} of ${questions.length}`}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        {!isComplete && (
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-secondary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-10 h-[calc(100%-140px)] overflow-y-auto">
          {isComplete ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10 text-secondary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-bold text-primary mb-4">
                Thank you, {formData.founderName.split(' ')[0]}!
              </h3>
              <p className="text-slate-600 mb-8 max-w-sm">
                We've received your information and will be in touch within 24
                hours to discuss your WhiteCoat Brief.
              </p>
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          ) : isSubmitting ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-secondary rounded-full animate-spin mb-4" />
              <p className="text-slate-600">Submitting your responses...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-primary mb-2">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.subtitle && (
                  <p className="text-slate-500">{currentQuestion.subtitle}</p>
                )}
              </div>

              {renderInput()}

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentStep === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  Back
                </button>

                {currentQuestion.type !== 'select' && (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                      canProceed()
                        ? 'bg-secondary text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {currentStep === questions.length - 1 ? 'Submit' : 'Continue'}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                )}
              </div>

              {currentQuestion.type !== 'select' && (
                <p className="text-sm text-slate-400 text-center">
                  Press{' '}
                  <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">
                    Enter
                  </kbd>{' '}
                  to continue
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
