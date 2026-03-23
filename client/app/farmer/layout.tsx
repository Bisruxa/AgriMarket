"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Context } from "../context/Context";
import { ReactNode } from "react";
import AddCrop from "@/components/Farmer/AddCrop";
import Sidebar from "@/components/SideBar/sidebar";


interface NodeProp {
  children: ReactNode;
}
const Framerlayout = ({ children }: NodeProp) => {
  const [show, setShow] = useState<boolean>(false);
  return (
    <>
      <div className=" relative flex px-5 bg-black/1.5">
        <div className="flex-1 fixed top-0 left-0 border-r border-black/6  px-5 ">
                <Sidebar role={"farmer"} />
        </div>
        <div className="flex-[4.5] ml-65 min-h-screen px-3 py-2 flex flex-col">
          <div className="flex-1">
            <Context.Provider value={{ show, setShow }}>
              {children}
            </Context.Provider>
          </div>
          <div className="flex items-center mt-4 space-x-1">
            <Image
              width={20}
              height={20}
              className="w-5 h-5"
              src="/corn.avif"
              alt="cornImage"
            />
            <p className="text-black/70 text-xs">
              Ready to farm smarter? Grow with AgriMarket.
              <br />
              &copy;2026 AgriMarket
            </p>
          </div>
        </div>
      </div>
      {show && (
        <div onClick={()=>setShow(false)} className=' absolute inset-0 bg-black/70 w-full h-screen'>
          <AddCrop />
        </div>
      )}
    </>
  );
};

export default Framerlayout;
