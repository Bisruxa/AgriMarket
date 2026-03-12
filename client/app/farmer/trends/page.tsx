"use client"

import * as React from "react"
import {
  Wheat,
  Vegan ,
  Apple,
  Leaf,
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

export default function FarmsteadDashboard() {
  const priceData = [
    { label: 'Jan', value: 1890 },
    { label: 'Feb', value: 1950 },
    { label: 'Mar', value: 2020 },
    { label: 'Apr', value: 2180 },
    { label: 'May', value: 2330 },
    { label: 'Jun', value: 2280 },
  ]

  const demandData = [
    { label: 'Jan', value: 98 },
    { label: 'Feb', value: 105 },
    { label: 'Mar', value: 118 },
    { label: 'Apr', value: 130 },
    { label: 'May', value: 142 },
    { label: 'Jun', value: 150 },
  ]

  const priceConfig = {
    value: { label: "Price", color: "#1f6e4a" },
  } satisfies ChartConfig

  const demandConfig = {
    value: { label: "Demand index", color: "#479e73" },
  } satisfies ChartConfig

  const marketData = [
    { market: "Guntur", demand: "1,280", trend: { label: "+8%", up: true, value: "+8%" }, price: "₹2,150" },
    { market: "Vijayawada", demand: "2,100", trend: { label: "+15%", up: true, value: "+15%" }, price: "₹2,230" },
    { market: "Eluru", demand: "940", trend: { label: "steady", up: false, value: "steady" }, price: "₹2,020" },
    { market: "Kurnool", demand: "1,520", trend: { label: "+5%", up: true, value: "+5%" }, price: "₹2,090" },
    { market: "Nellore", demand: "1,750", trend: { label: "+11%", up: true, value: "+11%" }, price: "₹2,180" },
  ]

  const infoItems = [
    { 
      icon: <DollarSign className="h-5 w-5" />, 
      label: "avg. price (paddy)", 
      value: "2,140 ₹/qtl", 
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

  return (
    <div className="mx-auto w-full max-w-7xl rounded-[40px] border border-[#d4e6dc] bg-white p-8">
      <div className="mb-5 inline-flex rounded-full border border-[#bfdfce] bg-[#f3faf6] p-1">
        <span className="inline-flex cursor-default items-center gap-2 rounded-full bg-[#1f543c] px-6 py-2 text-sm font-medium text-white">
          <Wheat className="h-4 w-4" />
          Paddy
        </span>
        <span className="inline-flex cursor-default items-center gap-2 rounded-full px-6 py-2 text-sm font-medium text-[#2a553d]">
          <Vegan  className="h-4 w-4" />
          Maize
        </span>
        <span className="inline-flex cursor-default items-center gap-2 rounded-full px-6 py-2 text-sm font-medium text-[#2a553d]">
          <Apple className="h-4 w-4" />
          Cotton
        </span>
        <span className="inline-flex cursor-default items-center gap-2 rounded-full px-6 py-2 text-sm font-medium text-[#2a553d]">
          <Leaf className="h-4 w-4" />
          Sugarcane
        </span>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <LineGraph
          data={priceData}
          title="Price history (₹/quintal)"
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

      <div className="mt-8 flex justify-between border-t border-dashed border-[#bcdbcc] pt-4 text-xs text-[#57886c]">
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