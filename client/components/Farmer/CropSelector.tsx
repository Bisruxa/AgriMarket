import { Wheat } from "lucide-react"
import React from "react"

interface CropSelectorProps {
  commonCrops: string[]
  selectedCrop: string
  onCropChange: (crop: string) => void
  cropLabels: Record<string, { en: string; am: string }>
  language: string
}

export const CropSelector = ({
  commonCrops,
  selectedCrop,
  onCropChange,
  cropLabels,
  language
}: CropSelectorProps) => {
  const [searchCrop, setSearchCrop] = React.useState("")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchCrop.trim()) return
    const normalized = searchCrop.trim().toLowerCase()
    onCropChange(normalized)
  }

  return (
    <div className="mb-5 flex w-full flex-col gap-3 rounded-2xl border border-[#bfdfce] bg-[#f3faf6] p-2">
      <div className="flex w-full flex-wrap gap-2">
        {commonCrops.map((crop) => {
          const isActive = selectedCrop === crop
          return (
            <button
              key={crop}
              type="button"
              onClick={() => onCropChange(crop)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                isActive ? "bg-[#1f543c] text-white" : "text-[#2a553d] hover:bg-[#e6f3ec]"
              }`}
            >
              <Wheat className="h-4 w-4" />
              {cropLabels[crop][language as keyof typeof cropLabels.teff]}
            </button>
          )
        })}
      </div>
      {/* <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
        <input
          type="text"
          value={searchCrop}
          onChange={(e) => setSearchCrop(e.target.value)}
          placeholder={language === "am" ? "የሰብል ስም ፈልግ" : "Search crop name"}
          className="w-full rounded-md border border-[#bfdfce] bg-white px-3 py-2 text-sm outline-none focus:border-[#1f6e4a]"
        />
        <button
          type="submit"
          className="rounded-md bg-[#1f543c] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f6e4a] transition-colors"
        >
          {language === "am" ? "አሳይ" : "Show"}
        </button>
      </form> */}
    </div>
  )
}