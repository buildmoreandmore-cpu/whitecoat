'use client'

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
}

interface ImageGalleryProps {
  images: GeneratedImage[]
  concepts: AdConcept[]
}

export default function ImageGallery({ images, concepts }: ImageGalleryProps) {
  // Group images by ad number
  const imagesByAd = new Map<number, GeneratedImage[]>()
  for (const img of images) {
    const existing = imagesByAd.get(img.adNumber) || []
    existing.push(img)
    imagesByAd.set(img.adNumber, existing)
  }

  return (
    <div className="space-y-6">
      {concepts.map((concept) => {
        const adImages = imagesByAd.get(concept.adNumber) || []
        const sortedImages = [...adImages].sort((a, b) => a.imageNumber - b.imageNumber)

        return (
          <div
            key={concept.adNumber}
            className="border border-slate-200 rounded-lg overflow-hidden"
          >
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
              <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">
                AD {String(concept.adNumber).padStart(2, '0')}
              </span>
              <span className="font-medium text-slate-900">{concept.title}</span>
              <span className="text-sm text-slate-500">{concept.hookType}</span>
            </div>

            <div className="p-4">
              {sortedImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {sortedImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group"
                    >
                      <img
                        src={img.imageUrl}
                        alt={`Ad ${img.adNumber} - Variation ${img.imageNumber}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                          V{img.imageNumber}
                        </span>
                      </div>
                      <a
                        href={img.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <span className="bg-white text-slate-900 text-xs font-medium px-3 py-1.5 rounded-full">
                          View Full
                        </span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <svg
                    className="w-8 h-8 mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm">No images generated yet</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
