"use client"
import * as React from "react"
import { Table2, TrendingUp, Minus} from "lucide-react"

interface MarketRow {
  market: string
  demand: string
  trend: { label: string; up: boolean; value: string }
  price: string
}

interface DataTableProps {
  title: string
  data: MarketRow[]
  footnotes?: React.ReactNode
  className?: string
  compact?: boolean
  columnLabels?: {
    period?: string
    trend?: string
    price?: string
    demand?: string
  }
}

export function DataTable({
  title,
  data,
  footnotes,
  className = '',
  compact = false,
  columnLabels,
}: DataTableProps) {
  const labels = {
    period: columnLabels?.period ?? 'market',
    demand: columnLabels?.demand ?? 'demand (tonnes)',
    trend: columnLabels?.trend ?? 'trend',
    price: columnLabels?.price ?? 'price indication',
  }

  return (
    <div
      className={`rounded-2xl border border-[#d0e2d7] bg-[#fbfefc] ${
        compact ? 'max-w-md p-4' : 'w-full p-6'
      } ${className}`}
    >
      <div
        className={`mb-4 flex items-center gap-2 font-semibold text-[#1e402e] ${
          compact ? 'text-sm' : 'text-lg'
        }`}
      >
        <Table2 className={`text-[#2b7551] ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
        <span>{title}</span>
      </div>

      <div className={compact ? '' : 'overflow-x-auto'}>
        <table className={`w-full border-collapse ${compact ? 'table-fixed text-sm' : ''}`}>
          <thead>
            <tr className="border-b border-[#c3e0d1] text-left text-xs font-medium uppercase text-[#567865]">
              <th className={`pb-2 ${compact ? 'w-[42%] pr-2' : ''}`}>{labels.period}</th>
              {!compact && <th className="pb-2">{labels.demand}</th>}
              <th className={`pb-2 ${compact ? 'w-[28%]' : ''}`}>{labels.trend}</th>
              <th className={`pb-2 ${compact ? 'w-[30%] text-right' : ''}`}>{labels.price}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-b border-[#e0efe7] text-sm text-[#193d29]">
                <td className={`py-2 ${compact ? 'truncate pr-2' : ''}`}>{row.market}</td>
                {!compact && <td className="py-2">{row.demand}</td>}
                <td className="py-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full text-xs font-semibold ${
                    compact ? 'px-2 py-0.5' : 'px-3 py-1'
                  } ${
                    row.trend.up
                      ? "bg-[#e6f6ec] text-[#15803d]"
                      : "bg-[#fef4e6] text-[#a16207]"
                  }`}
                >
                  {row.trend.up ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {row.trend.label}
                </span>
              </td>
              <td
                className={`py-2 font-semibold text-[#1c6a41] ${
                  compact ? 'text-right text-xs' : ''
                }`}
              >
                {row.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {footnotes && (
        <>
          <hr className="my-2 border-[#d0eadc]" />
          <div className="flex flex-wrap gap-3 pt-1 text-xs text-[#366e4b]">{footnotes}</div>
        </>
      )}
    </div>
  )
}