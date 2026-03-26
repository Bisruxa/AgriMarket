"use client"

import * as React from "react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { TrendingUp, Calendar, Clock } from "lucide-react"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface LineGraphProps {
  data: { label: string; value: number }[]
  title: string
  badge?: string
  badgeIcon?: React.ReactNode
  minNotice?: string
  maxNotice?: string
  config: ChartConfig
}

export function LineGraph({
  data,
  title,
  badge,
  badgeIcon,
  minNotice,
  maxNotice,
  config,
}: LineGraphProps) {
  const chartData = data.map((item) => ({
    month: item.label,
    value: item.value,
  }))

  return (
    <div className="rounded-3xl border border-[#d2e5da] bg-[#fcfefd] p-6 pb-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-[#1e3829]">
          <TrendingUp className="h-5 w-5 text-[#437a5b]" />
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
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#cce3d9" />
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
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={3}
              dot={{ fill: "#277c51", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </div>

      <div className="mt-2 flex justify-between text-xs text-[#427a5b]">
        {minNotice && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {minNotice}
          </span>
        )}
        {maxNotice && (
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {maxNotice}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          updated today
        </span>
      </div>
    </div>
  )
}