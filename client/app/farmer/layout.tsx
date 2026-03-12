/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ReactNode } from "react";
import FarmerSidebar from "./sidebar";
interface NodeProp {
  children: ReactNode;
}
const Framerlayout = ({ children }: NodeProp) => {
  return (
    <div className="flex px-5 bg-black/1.5">
      <div className="flex-1 fixed top-0 left-0 border-r border-black/6  px-5 ">
        <FarmerSidebar />
      </div>
      <div className="flex-[4.5] ml-65 min-h-screen px-3 py-2 flex flex-col">
        <div className="flex-1">{children}</div>
        <div className="flex items-center mt-4 space-x-1">
          <img className="w-5 h-5" src="/corn.avif" alt="cornImage" />
          <p className="text-black/70 text-xs">
            Ready to farm smarter? Grow with AgriMarket.
            <br />
            &copy;2026 AgriMarket
          </p>
        </div>
      </div>
    </div>
  );
};

export default Framerlayout;
