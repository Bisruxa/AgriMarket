'use client'
import WelcomeCard from "@/components/cards/welcomCard"
import WatchList from "@/components/cards/watchList"
import Header from "@/components/common/Header"
export default function page() {
  return (
    <>
    <Header/>
    <WelcomeCard/>
    <WatchList/>
    </>
  )
}
