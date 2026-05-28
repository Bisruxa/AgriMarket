'use client'
import Header from "@/components/common/Header"
import ManageFarms from "@/components/Farmer/ManageFarms"

export default function FarmsPage() {
  return (
    <>
      <Header />
      <div className="px-1">
        <ManageFarms />
      </div>
    </>
  )
}
