"use client"

import * as React from "react"
import {
  Wheat,
  TrendingUp,
  Tractor,
  Clock,
  Warehouse,
  DollarSign,
  PieChart,
  Cloud,
  Info,
  Calendar,
} from "lucide-react"

import { PriceChart } from "../../../components/Farmer/PriceChart"
import { DemandChart } from "../../../components/Farmer/DemandChart"
import { MarketTable } from "../../../components/Farmer/MarketTable"
import { InfoCards } from "@/components/common/Info"
import { useLanguage } from "@/app/context/LanguageContext"
import { CropSelector } from "../../../components/Farmer/CropSelector"
import { DateRangePicker } from "../../../components/Farmer/DataRangePicker"
import { usePriceData } from "../../../components/hooks/usePriceData"

interface DateRange {
  startDate: string
  endDate: string
}

// Define the crop labels type
type CropLabels = {
  [key: string]: {
    en: string
    am: string
  }
}

export default function FarmsteadDashboard() {
  const { language } = useLanguage()
  const [selectedCrop, setSelectedCrop] = React.useState<string>("barley")
  const [dateRange, setDateRange] = React.useState<DateRange>({
    startDate: "2024-01-01",
    endDate: "2025-02-01",
  })
  
  const { priceData, isLoading, error, fetchPriceData } = usePriceData(language)

  const cropLabels: CropLabels = {
    teff: { en: "Teff", am: "ጤፍ" },
    barley: { en: "Barley", am: "ገብስ" },
    wheat: { en: "Wheat", am: "ስንዴ" },
    sorghum: { en: "Sorghum", am: "ማሽላ" },
    corn: { en: "Corn", am: "በቆሎ" },
    maize: { en: "Maize", am: "በቆሎ" },
  }

  // Fix: Ensure language is properly typed as 'en' | 'am'
  const activeCropLabel = cropLabels[selectedCrop]?.[language as keyof typeof cropLabels.teff] ?? selectedCrop

  // Format date for display
  const formatDateForDisplay = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === "am" ? "am-ET" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Fetch data when selected crop or date range changes
  React.useEffect(() => {
    fetchPriceData(selectedCrop, dateRange.startDate, dateRange.endDate)
  }, [selectedCrop, dateRange.startDate, dateRange.endDate, fetchPriceData])

  // Calculate price trend
  const priceTrend = React.useMemo(() => {
    if (priceData.length < 2) return null
    const firstPrice = priceData[0].value
    const lastPrice = priceData[priceData.length - 1].value
    const change = ((lastPrice - firstPrice) / firstPrice) * 100
    return change.toFixed(1)
  }, [priceData])

  // Fix: Convert priceTrend to number for comparison
  const percentChange = priceTrend ? `${parseFloat(priceTrend) >= 0 ? "+" : ""}${priceTrend}%` : null

  // Info items with real data
  const infoItems = [
    { 
      icon: <DollarSign className="h-5 w-5" />, 
      label: language === "am" ? "አማካይ ዋጋ (ሩዝ)" : "Average Price (Paddy)", 
      value: priceData.length > 0 
        ? `${Math.round(priceData.reduce((sum, d) => sum + d.value, 0) / priceData.length)} ETB/quintal`
        : "2,140 ETB/quintal", 
      note: priceData.length > 0 ? `over ${priceData.length} days` : "↑ 4% above MSP"
    },
    { 
      icon: <PieChart className="h-5 w-5" />, 
      label: language === "am" ? "የፍላጎት መረጃ ጠቋሚ" : "Demand Index", 
      value: "142 points", 
      note: "+12 vs last fortnight" 
    },
    { 
      icon: <Clock className="h-5 w-5" />, 
      label: language === "am" ? "ምርጥ የሽያጭ ጊዜ" : "Best Selling Window", 
      value: language === "am" ? "ቀጣይ 2 ሳምንታት" : "Next 2 weeks", 
      note: language === "am" ? "ትንበያ: የዋጋ ጭማሪ" : "Forecast: price uptick" 
    },
    { 
      icon: <Warehouse className="h-5 w-5" />, 
      label: language === "am" ? "የማከማቻ ምክር" : "Storage Advice", 
      value: language === "am" ? "ዝቅተኛ ክምችት" : "Low stock", 
      note: language === "am" ? "40% አሁን ሽጥ፣ ከፍታ ጠብቅ" : "Sell 40% now, wait for peak" 
    },
  ]

  const handleCropChange = (crop: string) => {
    setSelectedCrop(crop)
  }

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange)
  }

  return (
    <div className="mx-auto w-full max-w-7xl bg-transparent p-0">
      {/* Crop Selection Section */}
      <CropSelector
        commonCrops={["teff", "barley", "wheat", "sorghum", "corn"]}
        selectedCrop={selectedCrop}
        onCropChange={handleCropChange}
        cropLabels={cropLabels}
        language={language}
      />

      {/* Charts Section */}
      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PriceChart
          priceData={priceData}
          cropName={activeCropLabel}
          isLoading={isLoading}
          error={error}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          percentChange={percentChange}
          language={language}
          formatDateForDisplay={formatDateForDisplay}
        />
        
        <DemandChart language={language} />
      </div>

      {/* Market Data and Info Section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.8fr_1fr]">
        <MarketTable language={language} />
        <InfoCards items={infoItems} />
      </div>

      {/* Footer */}
      <div className="mt-8 flex flex-col gap-2 border-t border-dashed border-[#bcdbcc] pt-4 text-xs text-[#57886c] sm:flex-row sm:justify-between">
        <span className="flex items-center gap-1">
          <Cloud className="h-3 w-3" /> 
          {language === "am" ? "የቀጥታ ውሂብ" : "Live data"} · {language === "am" ? "የዘመነ" : "Updated"} {new Date().toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" /> 
          {language === "am" ? "ጊዜ" : "Period"}: {formatDateForDisplay(dateRange.startDate)} - {formatDateForDisplay(dateRange.endDate)}
        </span>
        <span className="flex items-center gap-1">
          <Info className="h-3 w-3" /> 
          {language === "am" ? "ምንጮች" : "Sources"}: local mandi, FICCI, AgMarket
        </span>
      </div>
    </div>
  )
}