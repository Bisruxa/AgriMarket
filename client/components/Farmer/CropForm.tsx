"use client"
import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

// Crop options data
const cropOptions = [
  "Rice",
  "Wheat",
  "Maize",
  "Barley",
  "Soybean",
  "Potato",
  "Tomato",
  "Coffee",
  "Tea",
  "Sorghum",
  "Millet",
  "Chickpea",
  "Sunflower",
  "Sesame",
  "Cotton",
  "Sugarcane",
  "Cabbage",
  "Carrot",
  "Onion",
  "Garlic",
  "Pepper",
  "Strawberry",
  "Avocado",
  "Mango",
  "Banana",
] as const

type CropOption = typeof cropOptions[number] | "OTHER"

interface CropFormProps {
  className?: string
  onSubmit?: (data: CropFormData) => void
  showBackButton?: boolean
}

interface CropFormData {
  crop: string
  amount: string
  price: string
}

export function CropForm({ className, onSubmit, showBackButton = true }: CropFormProps) {
  const router = useRouter()
  const [selectedCrop, setSelectedCrop] = React.useState<CropOption | undefined>()
  const [otherCrop, setOtherCrop] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [price, setPrice] = React.useState("")

  const handleCropChange = (value: CropOption) => {
    setSelectedCrop(value)
    if (value !== "OTHER") {
      setOtherCrop("")
    }
  }

  const getDisplayCrop = () => {
    if (selectedCrop === "OTHER") {
      return otherCrop || "other (specify)"
    }
    return selectedCrop || "crop?"
  }

  const getCropForPreview = () => {
    if (selectedCrop === "OTHER") {
      return otherCrop || "other (specify)"
    }
    return selectedCrop || "— select crop —"
  }

  const previewText = `${getCropForPreview()} | ${amount || "0"} qt , ${price || "0"} birr /qt`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let cropValue: string
    if (selectedCrop === "OTHER") {
      cropValue = otherCrop
    } else if (selectedCrop) {
      cropValue = selectedCrop
    } else {
      cropValue = ""
    }

    const cropData: CropFormData = {
      crop: cropValue,
      amount,
      price,
    }
    onSubmit?.(cropData)
    alert("Submitted (demo)")
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className={cn("flex h-screen w-full", className)}>
      <div className="relative w-1/2 h-full overflow-hidden">
        <Image
          src="/farmer.jpg"
          alt="Crop field"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
      </div>

      <div className="w-1/2 h-full overflow-y-auto bg-white">
        <div className="flex min-h-full flex-col">
          {showBackButton && (
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-6 pt-6 pb-2">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back
              </button>
            </div>
          )}

          <div className="flex-1 flex items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-120">
              <h2 className="mb-1 text-4xl font-semibold tracking-tight text-[#2a5a2a]">
                Crop Details
              </h2>
              <p className="mb-8 text-sm text-gray-500">
                Enter crop production information
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="crop-select" className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Crop Type
                    </Label>
                    <Select
                      value={selectedCrop}
                      onValueChange={handleCropChange}
                    >
                      <SelectTrigger id="crop-select" className="h-12 w-full border-gray-200 bg-white">
                        <SelectValue placeholder="— select crop —" />
                      </SelectTrigger>
                      <SelectContent>
                        {cropOptions.map((crop) => (
                          <SelectItem key={crop} value={crop}>
                            {crop}
                          </SelectItem>
                        ))}
                        <SelectItem value="OTHER">Other (specify)</SelectItem>
                      </SelectContent>
                    </Select>

                    {selectedCrop === "OTHER" && (
                      <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Input
                          type="text"
                          placeholder="Type crop name"
                          value={otherCrop}
                          onChange={(e) => setOtherCrop(e.target.value)}
                          className="h-12 w-full border-gray-200"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Amount (in qt)
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-12 w-full border-gray-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Price (pre qt)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="h-12 w-full border-gray-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex-1 rounded-full border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Preview
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 flex-1 rounded-full bg-[#2a5a2a] text-white transition-all hover:bg-[#1e431e] hover:-translate-y-0.5"
                  >
                    Submit
                  </Button>
                </div>

                <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50/80 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                    Preview
                  </p>
                  <p className="text-base text-gray-800">
                    {previewText}
                  </p>
                  {(!selectedCrop || (selectedCrop === "OTHER" && !otherCrop) || !amount || !price) && (
                    <p className="mt-2 text-xs text-amber-600">
                      ⚠️ Please fill in all fields to see complete preview
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}