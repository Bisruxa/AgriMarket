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
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Leaf, Calendar, MapPin, Package, DollarSign } from "lucide-react"

const cropOptions = [
  "Rice", "Wheat", "Maize", "Barley", "Soybean", "Potato", "Tomato",
  "Coffee", "Tea", "Sorghum", "Millet", "Chickpea", "Sunflower",
  "Sesame", "Cotton", "Sugarcane", "Cabbage", "Carrot", "Onion",
  "Garlic", "Pepper", "Strawberry", "Avocado", "Mango", "Banana",
] as const

type CropOption = typeof cropOptions[number] | "OTHER"

export interface CropFormData {
  name: string
  description: string
  price: string
  unit: string
  category: string
  stock: string
  location: string
  harvestDate: string
}

interface CropFormProps {
  initialData?: CropFormData
  productId?: string
  onSubmit?: (data: CropFormData) => void
  onClose?: () => void
  isLoading?: boolean
  errorMessage?: string | null
}

export function CropForm({ 
  initialData, 
  productId,
  onSubmit, 
  onClose,
  isLoading = false,
  errorMessage = null
}: CropFormProps) {
  const [selectedCrop, setSelectedCrop] = React.useState<CropOption | undefined>()
  const [otherCrop, setOtherCrop] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [unit, setUnit] = React.useState("KG")
  const [category, setCategory] = React.useState("VEGETABLES")
  const [stock, setStock] = React.useState("")
  const [harvestDate, setHarvestDate] = React.useState("")
  const [formError, setFormError] = React.useState<string | null>(null)

  // Initialize form with data if in edit mode
  React.useEffect(() => {
    if (initialData) {
      const cropValue = initialData.name
      if (cropOptions.includes(cropValue as any)) {
        setSelectedCrop(cropValue as CropOption)
      } else {
        setSelectedCrop("OTHER")
        setOtherCrop(cropValue)
      }
      setDescription(initialData.description || "")
      setPrice(initialData.price)
      setUnit(initialData.unit || "KG")
      setCategory(initialData.category || "VEGETABLES")
      setStock(initialData.stock)
      setHarvestDate(initialData.harvestDate?.split('T')[0] || "")
    }
  }, [initialData])

  const handleCropChange = (value: CropOption) => {
    setSelectedCrop(value)
    if (value !== "OTHER") setOtherCrop("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    let cropName = ""
    if (selectedCrop === "OTHER") {
      if (!otherCrop.trim()) {
        setFormError("Please specify the crop name.")
        return
      }
      cropName = otherCrop
    } else if (selectedCrop) {
      cropName = selectedCrop
    } else {
      setFormError("Please select a crop.")
      return
    }

    if (!description.trim()) {
      setFormError("Please enter a description.")
      return
    }

    if (!price || parseFloat(price) <= 0) {
      setFormError("Please enter a valid price.")
      return
    }

    if (!stock || parseInt(stock) <= 0) {
      setFormError("Please enter a valid stock quantity.")
      return
    }

    if (!harvestDate) {
      setFormError("Please select a harvest date.")
      return
    }

    const cropData: CropFormData = {
      name: cropName,
      description: description,
      price: price,
      unit: unit,
      category: category,
      stock: stock,
      location: "", // Will be filled from parent component
      harvestDate: harvestDate
    }

    onSubmit?.(cropData)
  }

  return (
    <div onClick={(e) => e.stopPropagation()} className="relative">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2a5a2a] to-[#3a7a3a] px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Leaf className="h-6 w-6 text-white" />
                <h2 className="text-2xl font-bold text-white">
                  {productId ? "Edit Crop" : "Add New Crop"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors text-3xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-white/80 text-sm mt-1 ml-9">
              {productId ? "Update your crop information" : "List your crop on the marketplace"}
            </p>
          </div>

          {/* Form Body */}
          <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Crop Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-[#2a5a2a]" />
                  Crop Type *
                </Label>
                <Select value={selectedCrop} onValueChange={handleCropChange} disabled={isLoading}>
                  <SelectTrigger className="h-11 w-full border-gray-200 bg-white rounded-lg">
                    <SelectValue placeholder="Select a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropOptions.map((crop) => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                    <SelectItem value="OTHER">Other (specify)</SelectItem>
                  </SelectContent>
                </Select>
                {selectedCrop === "OTHER" && (
                  <Input
                    type="text"
                    placeholder="Enter crop name"
                    value={otherCrop}
                    onChange={(e) => setOtherCrop(e.target.value)}
                    className="h-11 w-full border-gray-200 mt-2 rounded-lg"
                    disabled={isLoading}
                  />
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#2a5a2a]" />
                  Description *
                </Label>
                <Textarea
                  placeholder="Describe your crop quality, freshness, organic status..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border-gray-200 rounded-lg resize-none"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              {/* Price, Unit, Category */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#2a5a2a]" />
                    Price *
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-11 w-full border-gray-200 rounded-lg pl-8"
                      disabled={isLoading}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Unit *</Label>
                  <Select value={unit} onValueChange={setUnit} disabled={isLoading}>
                    <SelectTrigger className="h-11 w-full border-gray-200 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KG">Kilogram (KG)</SelectItem>
                      <SelectItem value="QTY">Quantity (QTY)</SelectItem>
                      <SelectItem value="TON">Ton (TON)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Category *</Label>
                  <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                    <SelectTrigger className="h-11 w-full border-gray-200 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRAINS">Grains</SelectItem>
                      <SelectItem value="VEGETABLES">Vegetables</SelectItem>
                      <SelectItem value="FRUITS">Fruits</SelectItem>
                      <SelectItem value="SEEDS">Seeds</SelectItem>
                      <SelectItem value="LIVESTOCK">Livestock</SelectItem>
                      <SelectItem value="DAIRY">Dairy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stock and Harvest Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#2a5a2a]" />
                    Stock Quantity *
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="h-11 w-full border-gray-200 rounded-lg"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#2a5a2a]" />
                    Harvest Date *
                  </Label>
                  <Input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="h-11 w-full border-gray-200 rounded-lg"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {(formError || errorMessage) && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-700">{formError || errorMessage}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-lg border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-11 rounded-lg bg-gradient-to-r from-[#2a5a2a] to-[#3a7a3a] text-white hover:from-[#1e431e] hover:to-[#2a5a2a] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {productId ? "Updating..." : "Submitting..."}
                    </div>
                  ) : (
                    productId ? "Update Crop" : "Add Crop"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}