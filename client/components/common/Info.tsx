"use client"

import * as React from "react"

interface InfoItem {
  icon: React.ReactNode
  label: string
  value: string
  note: string
}

interface InfoCardsProps {
  items: InfoItem[]
}

export function InfoCards({ items }: InfoCardsProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-4 rounded-2xl border border-[#caecdb] bg-[#f4fcf8] p-5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#daf2e6] text-[#1a6e44]">
            {item.icon}
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-[#2d4d39]">{item.label}</h4>
            <div className="text-2xl font-bold text-[#1b4c30]">{item.value}</div>
            <div className="mt-0.5 text-xs text-[#558466]">{item.note}</div>
          </div>
        </div>
      ))}
    </div>
  )
}