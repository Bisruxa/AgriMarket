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
}
export function DataTable({ title, data, footnotes }: DataTableProps) {
  return (
    <div className="rounded-3xl border border-[#d0e2d7] bg-[#fbfefc] p-6">
      <div className="mb-5 flex items-center gap-2 text-lg font-semibold text-[#1e402e]">
        <Table2 className="h-5 w-5 text-[#2b7551]" />
        <span>{title}</span>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#c3e0d1] text-left text-xs font-medium uppercase text-[#567865]">
            <th className="pb-2">market</th>
            <th className="pb-2">demand (tonnes)</th>
            <th className="pb-2">trend</th>
            <th className="pb-2">price indication</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-[#e0efe7] text-sm text-[#193d29]">
              <td className="py-2">{row.market}</td>
              <td className="py-2">{row.demand}</td>
              <td className="py-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
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
              <td className="py-2 font-semibold text-[#1c6a41]">{row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {footnotes && (
        <>
          <hr className="my-2 border-[#d0eadc]" />
          <div className="flex gap-4 pt-1 text-xs text-[#366e4b]">{footnotes}</div>
        </>
      )}
    </div>
  )
}