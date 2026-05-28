'use client'
import WelcomeCard from "@/components/cards/welcomCard"
import WatchList from "@/components/cards/watchList"
import Header from "@/components/common/Header"
import ManageFarms from "@/components/Farmer/ManageFarms"
export default function page() {
  return (
    <>
    <Header/>
    <WelcomeCard/>
    <ManageFarms/>
    <WatchList/>
    </>
  )
}
