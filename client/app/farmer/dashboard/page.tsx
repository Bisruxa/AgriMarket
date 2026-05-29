'use client'
import Link from "next/link"
import WelcomeCard from "@/components/cards/welcomCard"
import WatchList from "@/components/cards/watchList"
import Header from "@/components/common/Header"
import { Sprout, Plus } from "lucide-react"

export default function page() {
  return (
    <>
    <Header/>
    <WelcomeCard/>
    <div className="px-4 sm:px-5 mb-5">
      <div className="bg-white rounded-xl border border-[#5B8C51]/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#5B8C51]/10 rounded-lg">
            <Sprout className="h-6 w-6 text-[#5B8C51]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">My Farms</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Register your farm land and manage locations.
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/farmer/farms"
            className="px-4 py-2 rounded-lg border border-[#5B8C51]/40 text-[#2A5A2A] text-sm font-medium hover:bg-[#F5F9F5] transition-colors"
          >
            View Farms
          </Link>
          <Link
            href="/farmer/farms/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2A5A2A] text-white text-sm font-medium hover:bg-[#1E431E] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Farm
          </Link>
        </div>
      </div>
    </div>
    <WatchList/>
    </>
  )
}
