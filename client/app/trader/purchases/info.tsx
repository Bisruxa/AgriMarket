import React from "react";
import Image from "next/image";
import { NotebookPen } from 'lucide-react';
const CardContent = [
  { image: "/Total_Purchase.jpg", title: "Total Spent", value: "12,000" },
  { image: "/Total_Items.jpg", title: "Items Bought", value: "37" },
  { image: "/Last_Purchase.jpg", title: "Last Purchase", value: "2025" },
  { image: "/Pick_One.jpg", title: "Most bought", value: "teff" },
];
const Info = () => {
  return (
    <>  
        <div className="flex items-center gap-2 py-3">
            <NotebookPen className="text-[#2a5a2a]" size={28}/>
            <h1 className="text-base font-bold uppercase opacity-70 sm:text-lg">Purchase Journal</h1>
        </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CardContent.map((one, index) => (
          <div className="relative h-32 w-full sm:h-36" key={index}>
            <Image
              className="object-cover rounded-lg w-full h-full"
              src={one.image}
              width={1000}
              height={1000}
              alt={one.title}
            />
            <div className="absolute flex flex-col py-2 justify-end px-2 inset-0 rounded-lg bg-linear-to-t from-black via-transparent to-transparent">
              <h1 className="text-sm font-semibold text-white/95 sm:text-base">{one.title}</h1>
              <p className="text-xs text-white sm:text-sm">{one.value}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Info;
