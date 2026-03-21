import React from "react";
import { Tag, Hourglass, Award } from 'lucide-react';
import Header from "@/components/common/Header";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const test = [
  { current: 60, estimated: 40, recommendedLandSize: "15-20", icon: <Tag /> },
  { current: 60, estimated: 40, recommendedLandSize: "15-20", icon: <Hourglass /> },
  { current: 60, estimated: 40, recommendedLandSize: "15-20", icon: <Award /> },
];

const CropDetail = () => {
  return (
    <div>
      <Header></Header>
      {/* <div className="flex space-x-5">
        <div className="border border-gray-500 rounded-lg">
          <Image className="w-20 h-20" src="/corn.avif" alt="" width='64' height="24" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-[#2A5A2A]">Corn</h2>
          <p className="text-sm">
            <span className="font-bold">Best Suited For: </span>
            well-drained, fertile loamy soils (especially sandy loam or silt
            loam) with a slightly acidic to neutral pH of 5.8–7.0
          </p>
        </div>
      </div> */}
      
      
      {/* <div className="flex gap-4 p-4">
        {test.map((one, index) => (
          <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
            <div className="text-[#2A5A2A]">{one.icon}</div>
            <div>
              <div className="text-xs text-gray-500">Current: {one.current}%</div>
              <div className="text-xs text-gray-500">Est: {one.estimated}%</div>
            </div>
          </div>
        ))}
      </div> */}
      
      <div className="text-center justify-center align-center">
        <Button>Get Crop Recommendation</Button>

      </div>
    </div>
  );
};

export default CropDetail;