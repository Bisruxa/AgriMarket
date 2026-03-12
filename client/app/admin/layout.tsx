/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { ReactNode } from "react";
import Sidebar from '@/components/SideBar/NavigationLink';
interface NodeProp {
  children: ReactNode;
}
const Framerlayout = ({children}:NodeProp) => {

  return (
  <div className='flex py-5 px-10 bg-black/1.5'>
    <div className='flex-1 border-r border-black/6  px-5 '>
      <Sidebar/>
    </div>         
    <div className='flex-[3.5] px-15 py-5 '>
      {children}
        <div className="flex items-center mt-18 space-x-1">
        <img className="w-5 h-5" src="/corn.avif" alt="cornImage" />
        <p className="text-black/70 text-xs">Ready to farm smater? Grow with AgriMarket.
        <br />
          &copy;2026 AgriMarket
        </p>
       </div>
    </div>
  </div>
  )
}

export default Framerlayout