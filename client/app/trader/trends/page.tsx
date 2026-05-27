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
} from "lucide-react"
import { LineGraph } from "@/components/common/LineGraph"
import { BarGraph } from "@/components/common/BarGraph"
import { DataTable } from "@/components/common/Table"
import { InfoCards } from "@/components/common/Info"
import type { ChartConfig } from "@/components/ui/chart"
import { useLanguage } from "@/app/context/LanguageContext"

export default function FarmsteadDashboard() {
  const { language } = useLanguage()
  const [selectedCrop, setSelectedCrop] = React.useState("teff")
  const [searchCrop, setSearchCrop] = React.useState("")

  const cropLabels: Record<string, { en: string; am: string }> = {
    teff: { en: "Teff", am: "ጤፍ" },
    barley: { en: "Barley", am: "ገብስ" },
    wheat: { en: "Wheat", am: "ስንዴ" },
    sorghum: { en: "Sorghum", am: "ማሽላ" },
    corn: { en: "Corn", am: "በቆሎ" },
  }
  const commonCrops = ["teff", "barley", "wheat", "sorghum", "corn"]
  const activeCropLabel = cropLabels[selectedCrop]?.[language] ?? selectedCrop

  const baseByCrop: Record<string, number> = {
    teff: 2100,
    barley: 1700,
    wheat: 1900,
    sorghum: 1600,
    corn: 1800,
  }
  const base = baseByCrop[selectedCrop] ?? 1750
  const priceData = [
    { label: "Jan", value: base - 120 },
    { label: "Feb", value: base - 80 },
    { label: "Mar", value: base - 30 },
    { label: "Apr", value: base + 20 },
    { label: "May", value: base + 90 },
    { label: "Jun", value: base + 40 },
  ]
  const demandData = [
    { label: "Jan", value: 95 },
    { label: "Feb", value: 104 },
    { label: "Mar", value: 116 },
    { label: "Apr", value: 126 },
    { label: "May", value: 139 },
    { label: "Jun", value: 148 },
  ]

  const priceConfig = {
    value: { label: "Price", color: "#1f6e4a" },
  } satisfies ChartConfig

  const demandConfig = {
    value: { label: "Demand index", color: "#479e73" },
  } satisfies ChartConfig

  const marketData = [
    { market: "Guntur", demand: "1,280", trend: { label: "+8%", up: true, value: "+8%" }, price: "ETB 2,150" },
    { market: "Vijayawada", demand: "2,100", trend: { label: "+15%", up: true, value: "+15%" }, price: "ETB 2,230" },
    { market: "Eluru", demand: "940", trend: { label: "steady", up: false, value: "steady" }, price: "ETB 2,020" },
    { market: "Kurnool", demand: "1,520", trend: { label: "+5%", up: true, value: "+5%" }, price: "ETB 2,090" },
    { market: "Nellore", demand: "1,750", trend: { label: "+11%", up: true, value: "+11%" }, price: "ETB 2,180" },
  ]

  const infoItems = [
    { 
      icon: <DollarSign className="h-5 w-5" />, 
      label: "avg. price (paddy)", 
      value: "2,140 ETB/qtl", 
      note: "↑ 4% above MSP" 
    },
    { 
      icon: <PieChart className="h-5 w-5" />, 
      label: "demand index", 
      value: "142 pts", 
      note: "+12 vs last fortnight" 
    },
    { 
      icon: <Clock className="h-5 w-5" />, 
      label: "best selling window", 
      value: "next 2 weeks", 
      note: "forecast: price uptick" 
    },
    { 
      icon: <Warehouse className="h-5 w-5" />, 
      label: "storage advice", 
      value: "low stock", 
      note: "sell 40% now, wait for peak" 
    },
  ]
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchCrop.trim()) return
    const normalized = searchCrop.trim().toLowerCase()
    setSelectedCrop(normalized)
  }

  return (
    <div className="mx-auto w-full max-w-7xl bg-transparent p-0">
      <div className="mb-5 flex w-full flex-col gap-3 rounded-2xl border border-[#bfdfce] bg-[#f3faf6] p-2">
        <div className="flex w-full flex-wrap gap-2">
          {commonCrops.map((crop) => {
            const isActive = selectedCrop === crop
            return (
              <button
                key={crop}
                type="button"
                onClick={() => setSelectedCrop(crop)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                  isActive ? "bg-[#1f543c] text-white" : "text-[#2a553d] hover:bg-[#e6f3ec]"
                }`}
              >
                <Wheat className="h-4 w-4" />
                {cropLabels[crop][language]}
              </button>
            )
          })}
        </div>
        <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
          <input
            type="text"
            value={searchCrop}
            onChange={(e) => setSearchCrop(e.target.value)}
            placeholder={language === "am" ? "የሰብል ስም ፈልግ" : "Search crop name"}
            className="w-full rounded-md border border-[#bfdfce] bg-white px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-[#1f543c] px-4 py-2 text-sm font-medium text-white"
          >
            {language === "am" ? "አሳይ" : "Show"}
          </button>
        </form>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <LineGraph
          data={priceData}
          title={`${activeCropLabel} ${language === "am" ? "የዋጋ ታሪክ" : "Price history (ETB/quintal)"}`}
          badge="+8% vs last month"
          badgeIcon={<TrendingUp className="mr-1 h-3 w-3" />}
          minNotice="minimum 1850"
          maxNotice="peak 2330 (may)"
          config={priceConfig}
        />
        <BarGraph
          data={demandData}
          title="Demand trend (index)"
          badge="+12% demand"
          badgeIcon={<TrendingUp className="mr-1 h-3 w-3" />}
          leftNote="mandi active"
          rightNote="procurement high"
          config={demandConfig}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.8fr_1fr]">
        <DataTable
          title="Demand forecast by market"
          data={marketData}
          footnotes={
            <>
              <span className="flex items-center gap-1">
                <Tractor className="h-3 w-3" /> next harvest: 18–25 May
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> 3-month high
              </span>
            </>
          }
        />
        <InfoCards items={infoItems} />
      </div>

      <div className="mt-8 flex flex-col gap-2 border-t border-dashed border-[#bcdbcc] pt-4 text-xs text-[#57886c] sm:flex-row sm:justify-between">
        <span className="flex items-center gap-1">
          <Cloud className="h-3 w-3" /> live data · updated 25 Feb 2026, 10:30 AM
        </span>
        <span className="flex items-center gap-1">
          <Info className="h-3 w-3" /> sources: local mandi, FICCI, AgMarket
        </span>
      </div>
    </div>
  )
}