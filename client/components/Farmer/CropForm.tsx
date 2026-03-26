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
  onSubmit?: (data: CropFormData) => void
}

interface CropFormData {
  crop: string
  amount: string
  price: string
}

export function CropForm({ onSubmit }: CropFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let cropValue = ""

    if (selectedCrop === "OTHER") {
      cropValue = otherCrop
    } else if (selectedCrop) {
      cropValue = selectedCrop
    }

    const cropData: CropFormData = {
      crop: cropValue,
      amount,
      price,
    }

    onSubmit?.(cropData)
    alert("Submitted (demo)")
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="h-[90vh] w-[45vw] my-6 mx-auto rounded-4xl overflow-y-auto bg-white"
    >
      <div className="flex min-h-full flex-col">
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
                  <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Crop Type
                  </Label>

                  <Select value={selectedCrop} onValueChange={handleCropChange}>
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
                      className="h-12 w-full border-gray-200"
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
                    />
                  </div>
                </div>

              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-[#2a5a2a] text-white hover:bg-[#1e431e]"
              >
                Submit
              </Button>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}