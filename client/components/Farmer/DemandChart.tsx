/* eslint-disable @typescript-eslint/no-explicit-any */
import { TrendingUp } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface DemandChartProps {
  language: string
}

const demandData = [
  { month: "Jan", currentDemand: 95, forecastDemand: 98 },
  { month: "Feb", currentDemand: 104, forecastDemand: 108 },
  { month: "Mar", currentDemand: 116, forecastDemand: 120 },
  { month: "Apr", currentDemand: 126, forecastDemand: 132 },
  { month: "May", currentDemand: 139, forecastDemand: 145 },
  { month: "Jun", currentDemand: 148, forecastDemand: 156 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[#bfdfce] bg-white p-3 shadow-lg">
        <p className="text-sm font-medium text-[#1f543c]">{label}</p>
        <p className="text-sm mt-1">
          <span className="inline-block h-2 w-2 rounded-full bg-[#1f6e4a] mr-2"></span>
          <span className="font-medium">Current Demand:</span> {payload[0].value}
        </p>
        {payload[1] && (
          <p className="text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-[#479e73] mr-2"></span>
            <span className="font-medium">Forecast Demand:</span> {payload[1].value}
          </p>
        )}
      </div>
    )
  }
  return null
}

export const DemandChart = ({ language }: DemandChartProps) => {
  return (
    <div className="rounded-xl border border-[#bfdfce] bg-white p-4">
      {/* Chart Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#1f543c]">
            {language === "am" ? "የፍላጎት አዝማሚያ ትንተና" : "Demand Trend Analysis"}
          </h3>
          <p className="text-xs text-[#57886c]">
            {language === "am" ? "በወር የፍላጎት መረጃ ጠቋሚ እና ትንበያ" : "Demand index and forecast by month"}
          </p>
        </div>
        <div className="flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          <TrendingUp className="mr-1 h-3 w-3" />
          +12% {language === "am" ? "የፍላጎት እድገት" : "demand growth"}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={demandData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6f3ec" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#57886c', fontSize: 11 }}
            tickLine={{ stroke: '#bfdfce' }}
          />
          <YAxis 
            tick={{ fill: '#57886c', fontSize: 11 }}
            tickLine={{ stroke: '#bfdfce' }}
            label={{ 
              value: language === "am" ? "የፍላጎት መረጃ ጠቋሚ" : "Demand Index", 
              angle: -90, 
              position: 'insideLeft',
              fill: '#57886c',
              fontSize: 11
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="currentDemand" 
            fill="#1f6e4a" 
            name={language === "am" ? "የአሁኑ ፍላጎት" : "Current Demand"}
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="forecastDemand" 
            fill="#479e73" 
            name={language === "am" ? "የትንበያ ፍላጎት" : "Forecast Demand"}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Notes */}
      <div className="mt-3 flex justify-between text-xs border-t border-[#bfdfce] pt-3">
        <span className="flex items-center gap-2 text-[#57886c]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#1f6e4a]"></span>
          {language === "am" ? "የአሁኑ ፍላጎት" : "Current Demand"}
        </span>
        <span className="flex items-center gap-2 text-[#57886c]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#479e73]"></span>
          {language === "am" ? "የትንበያ ፍላጎት" : "Forecast Demand"}
        </span>
        <span className="text-[#57886c]">
          🏪 {language === "am" ? "ገበያ ንቁ" : "Mandi active"}
        </span>
        <span className="text-[#57886c]">
          📦 {language === "am" ? "ግዥ ከፍተኛ" : "Procurement high"}
        </span>
      </div>
    </div>
  )
}