"use client"
import * as React from "react"
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
import { Loader2 } from "lucide-react"

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

export interface CropFormData {
  crop: string
  amount: string
  price: string
}

interface CropFormProps {
  initialData?: CropFormData
  productId?: string
  onSubmit?: (data: CropFormData) => void
  onClose?: () => void
  isLoading?: boolean
}

export function CropForm({ 
  initialData, 
  productId,
  onSubmit, 
  onClose,
  isLoading = false 
}: CropFormProps) {
  const [selectedCrop, setSelectedCrop] = React.useState<CropOption | undefined>()
  const [otherCrop, setOtherCrop] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [price, setPrice] = React.useState("")

  // Initialize form with data if in edit mode
  React.useEffect(() => {
    if (initialData) {
      // Check if the crop is in the predefined list or is "OTHER"
      const cropValue = initialData.crop
      if (cropOptions.includes(cropValue as any)) {
        setSelectedCrop(cropValue as CropOption)
      } else {
        setSelectedCrop("OTHER")
        setOtherCrop(cropValue)
      }
      
      setAmount(initialData.amount)
      setPrice(initialData.price)
    }
  }, [initialData])

  const handleCropChange = (value: CropOption) => {
    setSelectedCrop(value)
    if (value !== "OTHER") {
      setOtherCrop("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let cropValue = ""

    if (selectedCrop === "OTHER") {
      if (!otherCrop.trim()) {
        alert("Please specify the crop name")
        return
      }
      cropValue = otherCrop
    } else if (selectedCrop) {
      cropValue = selectedCrop
    } else {
      alert("Please select a crop")
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    if (!price || parseFloat(price) <= 0) {
      alert("Please enter a valid price")
      return
    }

    const cropData: CropFormData = {
      crop: cropValue,
      amount,
      price,
    }

    onSubmit?.(cropData)
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="h-[90vh] w-[45vw] my-6 mx-auto rounded-4xl overflow-y-auto bg-white"
    >
      <div className="flex min-h-full flex-col">
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-120">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-4xl font-semibold tracking-tight text-[#2a5a2a]">
                {productId ? "Edit Crop" : "Crop Details"}
              </h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              )}
            </div>
            <p className="mb-8 text-sm text-gray-500">
              {productId 
                ? "Update crop production information" 
                : "Enter crop production information"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Crop Type
                  </Label>

                  <Select 
                    value={selectedCrop} 
                    onValueChange={handleCropChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-12 w-full border-gray-200 bg-white">
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
                    <Input
                      type="text"
                      placeholder="Type crop name"
                      value={otherCrop}
                      onChange={(e) => setOtherCrop(e.target.value)}
                      className="h-12 w-full border-gray-200 mt-2"
                      disabled={isLoading}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Amount (in qt)
                    </Label>

                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 w-full border-gray-200"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Price (per qt)
                    </Label>

                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-12 w-full border-gray-200"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-full bg-[#2a5a2a] text-white hover:bg-[#1e431e] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {productId ? "Updating..." : "Submitting..."}
                  </div>
                ) : (
                  productId ? "Update" : "Submit"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}