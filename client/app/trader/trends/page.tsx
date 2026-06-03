"use client"

import * as React from "react"
import {
  Wheat,
  TrendingUp,
  TrendingDown,
  Tractor,
  Warehouse,
  DollarSign,
  PieChart,
  Cloud,
  Info,
  Loader2,
} from "lucide-react"
import { LineGraph } from "@/components/common/LineGraph"
import { BarGraph } from "@/components/common/BarGraph"
import { DataTable } from "@/components/common/Table"
import { InfoCards } from "@/components/common/Info"
import type { ChartConfig } from "@/components/ui/chart"
import { useLanguage } from "@/app/context/LanguageContext"
import { pricesApi, PriceRecord } from "@/lib/api"

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const CROP_KEYWORDS: Record<string, string[]> = {
  teff: ["Teff (white)", "Teff (mixed)", "Teff (black)"],
  barley: ["Barley (white)", "Barley (mixed)"],
  wheat: ["Wheat (white)", "Wheat (mixed)"],
  sorghum: ["Sorghum (white)", "Sorghum (red)", "Sorghum (yellow)"],
  corn: ["Maize"],
  potato: ["Potato"],
  onion: ["Onion"],
  tomato: ["Tomato"],
  coffee: ["Coffee (beans)", "Coffee (whole)"],
}

const CROP_LABELS: Record<string, { en: string; am: string }> = {
  teff: { en: "Teff", am: "ጤፍ" },
  barley: { en: "Barley", am: "ገብስ" },
  wheat: { en: "Wheat", am: "ስንዴ" },
  sorghum: { en: "Sorghum", am: "ማሽላ" },
  corn: { en: "Corn/Maize", am: "በቆሎ" },
  potato: { en: "Potato", am: "ስጋር" },
  onion: { en: "Onion", am: "ሽንኩርት" },
  tomato: { en: "Tomato", am: "ቲማቲም" },
  coffee: { en: "Coffee", am: "ቡና" },
}

const COMMON_CROPS = Object.keys(CROP_LABELS)

const DEMAND_DATA = [
  { label: "Jan", value: 95 },
  { label: "Feb", value: 104 },
  { label: "Mar", value: 116 },
  { label: "Apr", value: 126 },
  { label: "May", value: 139 },
  { label: "Jun", value: 148 },
]

const DEMAND_CONFIG = {
  value: { label: "Demand index", color: "#479e73" },
} satisfies ChartConfig

export default function FarmsteadDashboard() {
  const { language } = useLanguage()
  const [selectedCrop, setSelectedCrop] = React.useState("teff")
  const [selectedRegion, setSelectedRegion] = React.useState("Addis Ababa")
  const [searchCrop, setSearchCrop] = React.useState("")
  const [priceRecords, setPriceRecords] = React.useState<PriceRecord[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = React.useState<string>("")

  const availableRegions = [
    "Addis Ababa","Oromia","Amhara","Tigray","SNNP","Somali",
    "Afar","Dire Dawa","Harari","Gambella","Benshangul-Gumuz","Sidama",
  ]

  const fetchPrices = React.useCallback(async (cropKey: string, region: string) => {
    setLoading(true)
    setError(null)
    try {
      const cropNames = CROP_KEYWORDS[cropKey] || [cropKey]
      const all: PriceRecord[] = []

      const res = await pricesApi.getTrends({ cropName: cropNames[0], region, limit: 200 })
      if (res.success && res.data && res.data.length > 0) {
        all.push(...res.data)
      }

      if (all.length === 0) {
        for (const cn of cropNames) {
          const r = await pricesApi.getTrends({ cropName: cn, limit: 200 })
          if (r.success && r.data) {
            all.push(...r.data)
          }
        }
      }

      const seen = new Set<string>()
      const deduped = all.filter(r => {
        const k = `${r.year}-${r.month}-${r.region}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })

      deduped.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
      })

      setPriceRecords(deduped)
      if (deduped.length > 0) {
        setLastUpdated(
          new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
        )
      }
    } catch (e) {
      setError("Failed to load price data")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchPrices(selectedCrop, selectedRegion)
  }, [selectedCrop, selectedRegion, fetchPrices])

  const handleCropSelect = (crop: string) => {
    setSelectedCrop(crop)
    setSearchCrop("")
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchCrop.trim()) return
    const normalized = searchCrop.trim().toLowerCase().replace(/\s+/g, "-")
    setSelectedCrop(normalized)
  }

  const activeCropLabel = CROP_LABELS[selectedCrop]?.[language] ?? selectedCrop

  const chartData = React.useMemo(() => {
    if (priceRecords.length === 0) return []
    const sorted = [...priceRecords].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
    const last24 = sorted.slice(-24)
    return last24.map(r => ({
      label: `${MONTH_NAMES[r.month - 1]} ${r.year}`,
      value: Math.round(r.avgPrice),
    }))
  }, [priceRecords])

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].value : null
  const prevPrice = chartData.length > 1 ? chartData[chartData.length - 2].value : null
  const priceChange = currentPrice && prevPrice
    ? (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(1)
    : null
  const priceTrend = priceChange && parseFloat(priceChange) >= 0 ? "up" : "down"

  const avgPrice = chartData.length > 0
    ? Math.round(chartData.reduce((s, d) => s + d.value, 0) / chartData.length)
    : 0

  const priceConfig = {
    value: { label: "Price", color: "#1f6e4a" },
  } satisfies ChartConfig

  const infoItems = [
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: language === "am" ? "አማካይ ዋጋ" : "avg. price",
      value: currentPrice ? `ETB ${currentPrice.toLocaleString()}/kg` : "—",
      note: priceChange
        ? `${priceTrend === "up" ? "↑" : "↓"} ${Math.abs(parseFloat(priceChange))}% vs last month`
        : "",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: language === "am" ? "የ12 ወር አማካይ" : "12-month avg",
      value: avgPrice ? `ETB ${avgPrice.toLocaleString()}/kg` : "—",
      note: `${priceRecords.length} ${language === "am" ? "መዝግብ" : "records"}`,
    },
    {
      icon: <Warehouse className="h-5 w-5" />,
      label: language === "am" ? "ክልል" : "region",
      value: selectedRegion,
      note: selectedCrop,
    },
  ]

  const marketData = priceRecords.length > 0
    ? priceRecords.slice(-12).map(r => {
        const idx = priceRecords.indexOf(r)
        const prev = idx > 0 ? priceRecords[idx - 1] : null
        const trend = prev && prev.year !== r.year || (prev && prev.month !== r.month)
          ? (() => {
              const samePeriod = priceRecords.filter(p => p.month === r.month && p.year === r.year - 1)[0]
              if (samePeriod) {
                const pct = ((r.avgPrice - samePeriod.avgPrice) / samePeriod.avgPrice * 100).toFixed(1)
                return { label: `${parseFloat(pct) >= 0 ? "+" : ""}${pct}%`, up: parseFloat(pct) >= 0, value: pct }
              }
              return null
            })()
          : null
        return {
          market: `${MONTH_NAMES[r.month - 1]} ${r.year}`,
          demand: "—",
          trend: trend || { label: "—", up: false, value: "0" },
          price: `ETB ${Math.round(r.avgPrice).toLocaleString()}/kg`,
        }
      })
    : []

  return (
    <div className="mx-auto w-full max-w-7xl bg-transparent p-0">
      <div className="mb-5 flex w-full flex-col gap-3 rounded-2xl border border-[#bfdfce] bg-[#f3faf6] p-2">
        <div className="flex w-full flex-wrap gap-2">
          {COMMON_CROPS.map((crop) => {
            const isActive = selectedCrop === crop
            return (
              <button
                key={crop}
                type="button"
                onClick={() => handleCropSelect(crop)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                  isActive ? "bg-[#1f543c] text-white" : "text-[#2a553d] hover:bg-[#e6f3ec]"
                }`}
              >
                <Wheat className="h-4 w-4" />
                {CROP_LABELS[crop][language]}
              </button>
            )
          })}
        </div>
        <div className="flex w-full flex-wrap gap-2">
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="rounded-md border border-[#bfdfce] bg-white px-3 py-2 text-sm outline-none"
          >
            {availableRegions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
            <input
              type="text"
              value={searchCrop}
              onChange={e => setSearchCrop(e.target.value)}
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
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-[#2a553d]">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {language === "am" ? "የዋጋ መረጃ እየጫነ ነው..." : "Loading price data..."}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && priceRecords.length === 0 && (
        <div className="rounded-md border border-[#bfdfce] p-6 text-center text-[#57886c]">
          {language === "am"
            ? "ለዚህ ሰብል እና ክልል የዋጋ መረጃ አልተገኘም"
            : "No price data found for this crop and region."}
        </div>
      )}

      {!loading && !error && chartData.length > 0 && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <LineGraph
              data={chartData}
              title={`${activeCropLabel} ${language === "am" ? "የዋጋ ታሪክ" : "Price history (ETB/kg)"}`}
              badge={priceChange ? `${priceTrend === "up" ? "↑" : "↓"} ${Math.abs(parseFloat(priceChange))}%` : ""}
              badgeIcon={priceTrend === "up"
                ? <TrendingUp className="mr-1 h-3 w-3" />
                : <TrendingDown className="mr-1 h-3 w-3" />}
              minNotice={`${language === "am" ? "አማካይ" : "avg"} ${avgPrice}`}
              maxNotice={selectedRegion}
              config={priceConfig}
            />
            <BarGraph
              data={DEMAND_DATA}
              title={language === "am" ? "ፍላጎት አዝማሚያ" : "Demand trend (index)"}
              badge="+12%"
              badgeIcon={<TrendingUp className="mr-1 h-3 w-3" />}
              leftNote="mandi active"
              rightNote="procurement high"
              config={DEMAND_CONFIG}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.8fr_1fr]">
            <DataTable
              title={language === "am" ? "የዋጋ መረጃ በክልል" : "Price data by region"}
              data={marketData}
              footnotes={
                <>
                  <span className="flex items-center gap-1">
                    <Tractor className="h-3 w-3" />
                    {language === "am" ? "መዝግብ" : "Historical data"}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {language === "am" ? "የሰብል ግብይት" : "Crop prices"}
                  </span>
                </>
              }
            />
            <InfoCards items={infoItems} />
          </div>
        </>
      )}

      <div className="mt-8 flex flex-col gap-2 border-t border-dashed border-[#bcdbcc] pt-4 text-xs text-[#57886c] sm:flex-row sm:justify-between">
        <span className="flex items-center gap-1">
          <Cloud className="h-3 w-3" />
          {language === "am" ? "የዋጋ መረጃ" : "price data"} · {lastUpdated || "—"}
        </span>
        <span className="flex items-center gap-1">
          <Info className="h-3 w-3" />
          Sources: Ethiopian Agricultural Research Institute, Ethiopian Commodity Exchange, CSA
        </span>
      </div>
    </div>
  )
}