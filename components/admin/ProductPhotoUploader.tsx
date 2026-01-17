'use client'

import { useState, useRef } from 'react'

interface ProductPhoto {
  id: string
  url: string
  filename: string
}

interface ProductPhotoUploaderProps {
  submissionId: string
  initialPhotos: ProductPhoto[]
  onPhotosChange?: (photos: ProductPhoto[]) => void
}

export default function ProductPhotoUploader({
  submissionId,
  initialPhotos,
  onPhotosChange,
}: ProductPhotoUploaderProps) {
  const [photos, setPhotos] = useState<ProductPhoto[]>(initialPhotos)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)

    const newPhotos: ProductPhoto[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        setError(`${file.name}: Only image files are allowed`)
        continue
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name}: File must be less than 10MB`)
        continue
      }

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`/api/submissions/${submissionId}/photos`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Upload failed')
        }

        const photo = await response.json()
        newPhotos.push(photo)
      } catch (err) {
        setError(`${file.name}: ${err instanceof Error ? err.message : 'Upload failed'}`)
      }
    }

    if (newPhotos.length > 0) {
      const updatedPhotos = [...photos, ...newPhotos]
      setPhotos(updatedPhotos)
      onPhotosChange?.(updatedPhotos)
    }

    setIsUploading(false)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (photoId: string) => {
    try {
      const response = await fetch(
        `/api/submissions/${submissionId}/photos?photoId=${photoId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete photo')
      }

      const updatedPhotos = photos.filter((p) => p.id !== photoId)
      setPhotos(updatedPhotos)
      onPhotosChange?.(updatedPhotos)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo')
    }
  }

  return (
    <div className="space-y-4">
      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100"
            >
              <img
                src={photo.url}
                alt={photo.filename}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete photo"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                {photo.filename}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isUploading
            ? 'border-slate-300 bg-slate-50'
            : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50'
        }`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-slate-500">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-slate-600">
              Click to upload product photos
            </span>
            <span className="text-xs text-slate-400">
              JPEG, PNG, WebP, GIF up to 10MB each
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Photo count */}
      <p className="text-xs text-slate-500">
        {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
      </p>
    </div>
  )
}
