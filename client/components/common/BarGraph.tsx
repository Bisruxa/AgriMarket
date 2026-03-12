"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { PieChart, TrendingUp, Tractor, Truck } from "lucide-react"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface BarGraphProps {
  data: { label: string; value: number }[]
  title: string
  badge?: string
  badgeIcon?: React.ReactNode
  leftNote?: string
  rightNote?: string
  config: ChartConfig
}

export function BarGraph({
  data,
  title,
  badge,
  badgeIcon,
  leftNote,
  rightNote,
  config,
}: BarGraphProps) {
  const chartData = data.map((item) => ({
    month: item.label,
    value: item.value,
  }))

  return (
    <div className="rounded-3xl border border-[#d2e5da] bg-[#fcfefd] p-6 pb-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-[#1e3829]">
          <PieChart className="h-5 w-5 text-[#437a5b]" />
          {title}
        </h3>
        {badge && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#e0f0e8] px-3 py-1 text-xs font-medium text-[#236844]">
            {badgeIcon}
            {badge}
          </span>
        )}
      </div>

      <div className="relative h-[220px] w-full">
        <ChartContainer config={config} className="h-full w-full">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#d2eadf" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#3b7256', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#3b7256', fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={8}
              barSize={24}
            />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="mt-2 flex justify-between text-xs text-[#427a5b]">
        {leftNote && (
          <span className="flex items-center gap-1">
            <Tractor className="h-3 w-3" />
            {leftNote}
          </span>
        )}
        {rightNote && (
          <span className="flex items-center gap-1">
            <Truck className="h-3 w-3" />
            {rightNote}
          </span>
        )}
      </div>
    </div>
  )
}