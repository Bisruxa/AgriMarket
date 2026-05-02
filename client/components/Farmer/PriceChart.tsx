/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrendingUp, Loader2 } from "lucide-react"
import { DateRangePicker } from "./DataRangePicker"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface PriceChartProps {
  priceData: { label: string; value: number; fullDate: string }[]
  cropName: string
  isLoading: boolean
  error: string | null
  dateRange: { startDate: string; endDate: string }
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void
  percentChange: string | null
  language: string
  formatDateForDisplay: (date: string) => string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#bfdfce] bg-white p-3 shadow-lg">
        <p className="text-sm font-medium text-[#1f543c]">{label}</p>
        <p className="text-lg font-bold text-[#1f6e4a]">
          {payload[0].value.toLocaleString()} ETB/quintal
        </p>
        <p className="text-xs text-[#57886c] mt-1">
          Price per quintal
        </p>
      </div>
    )
  }
  return null
}

export const PriceChart = ({
  priceData,
  cropName,
  isLoading,
  error,
  dateRange,
  onDateRangeChange,
  percentChange,
  language,
  formatDateForDisplay
}: PriceChartProps) => {
  // Calculate min and max for annotations
  const minPrice = priceData.length > 0 ? Math.min(...priceData.map(d => d.value)) : 0
  const maxPrice = priceData.length > 0 ? Math.max(...priceData.map(d => d.value)) : 0
  const maxPricePoint = priceData.length > 0 ? priceData.find(d => d.value === maxPrice) : null
  const minPricePoint = priceData.length > 0 ? priceData.find(d => d.value === minPrice) : null

  return (
    <div className="relative">
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        formatDateForDisplay={formatDateForDisplay}
        language={language}
      />

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center rounded-xl border border-[#bfdfce] bg-white">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#1f6e4a]" />
            <p className="mt-2 text-sm text-[#57886c]">
              {language === "am" ? "የዋጋ መረጃ በመጫን ላይ..." : "Loading price data from API..."}
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50">
          <div className="text-center p-4">
            <div className="mb-2 text-4xl">⚠️</div>
            <p className="text-sm font-medium text-red-600">
              {language === "am" ? "የዋጋ መረጃ ማግኘት አልተቻለም" : "Unable to fetch price data"}
            </p>
            <p className="mt-1 text-xs text-red-500">{error}</p>
            <p className="mt-3 text-xs text-[#57886c]">
              {language === "am" 
                ? "እባክዎ የኢንተርኔት ግንኙነትዎን ያረጋግጡ ወይም በኋላ ይሞክሩ" 
                : "Please check your internet connection or try again later"}
            </p>
          </div>
        </div>
      ) : priceData.length === 0 ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-xl border border-yellow-200 bg-yellow-50">
          <div className="text-center p-4">
            <div className="mb-2 text-3xl">📊</div>
            <p className="text-sm font-medium text-yellow-700">
              {language === "am" ? "ምንም ውሂብ የለም" : "No data available"}
            </p>
            <p className="mt-1 text-xs text-[#57886c]">
              {language === "am" 
                ? "እባክዎ የተለየ የቀን ክልል ይምረጡ" 
                : "Please try a different date range"}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#bfdfce] bg-white p-4">
          {/* Chart Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#1f543c]">
                {cropName} {language === "am" ? "የዋጋ ታሪክ" : "Price History"}
              </h3>
              <p className="text-xs text-[#57886c]">
                {language === "am" ? "ዋጋ በኩንታል" : "Price per quintal (ETB)"}
              </p>
            </div>
            {percentChange && (
              <div className={`flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                parseFloat(percentChange) >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {parseFloat(percentChange) >= 0 && <TrendingUp className="mr-1 h-3 w-3" />}
                {percentChange} {language === "am" ? "ለውጥ" : "change"}
              </div>
            )}
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6f3ec" />
              <XAxis 
                dataKey="label" 
                tick={{ fill: '#57886c', fontSize: 11 }}
                tickLine={{ stroke: '#bfdfce' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fill: '#57886c', fontSize: 11 }}
                tickLine={{ stroke: '#bfdfce' }}
                tickFormatter={(value) => `${value.toLocaleString()}`}
                label={{ 
                  value: language === "am" ? "ዋጋ (ብር/ኩንታል)" : "Price (ETB/quintal)", 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: '#57886c',
                  fontSize: 11
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#1f6e4a" 
                strokeWidth={3}
                dot={false}
                
                name={language === "am" ? "ዋጋ" : "Price"}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Annotations */}
          {minPricePoint && maxPricePoint && (
            <div className="mt-3 flex justify-between text-xs border-t border-[#bfdfce] pt-3">
              <div className="flex items-center gap-2 text-[#57886c]">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                <span>
                  📉 {language === "am" ? "ዝቅተኛው" : "Minimum"}: {Math.round(minPrice)} ETB/quintal
                  <span className="ml-1 text-[#bfdfce]">({minPricePoint.label})</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#57886c]">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
                <span>
                  📈 {language === "am" ? "ከፍተኛው" : "Peak"}: {Math.round(maxPrice)} ETB/quintal
                  <span className="ml-1 text-[#bfdfce]">({maxPricePoint.label})</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}