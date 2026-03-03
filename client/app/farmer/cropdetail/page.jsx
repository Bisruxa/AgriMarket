/* eslint-disable @next/next/no-img-element */
import React from "react";
import {Tag,Hourglass,Award} from 'lucide-react';
const test = [
    {current:60,estimated:40,recommendedLandSize:"15-20",icon:<Tag/>},
    {current:60,estimated:40,recommendedLandSize:"15-20",icon:<Hourglass/>},
    {current:60,estimated:40,recommendedLandSize:"15-20",icon:<Award/>},
]
const CropDetail = () => {
  return (
    <div>
      <div className="flex space-x-5">
        <div className="border border-gray-500 rounded-lg">
          <img className="w-20 h-20" src="/corn.avif" alt="" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#2A5A2A]">Corn</h2>
          <p className="text-sm">
            <span className="font-bold">Best Suited For: </span>
            well-drained, fertile loamy soils (especially sandy loam or silt
            loam) with a slightly acidic to neutral pH of 5.8–7.0
          </p>
        </div>
      </div>
      <div>
       {test.map((one,index)=>{<div key={index}>{one.icon} </div>})}
      </div>
      <div></div>
    </div>
  );
};

export default CropDetail;
