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
        <div className="flex items-center space-x-2 py-3">
            <NotebookPen className="text-[#2a5a2a]" size={35}/>
            <h1 className="text-lg opacity-70 font-bold uppercase">Purchase Journal</h1>
        </div>
      <div className="flex space-x-2">
        {CardContent.map((one, index) => (
          <div className="h-35 w-65 relative " key={index}>
            <Image
              className="object-cover rounded-lg w-full h-full"
              src={one.image}
              width={1000}
              height={1000}
              alt={one.title}
            />
            <div className="absolute flex flex-col py-2 justify-end px-2 inset-0 rounded-lg bg-linear-to-t from-black via-transparent to-transparent">
              <h1 className="text-white/95 font-semibold">{one.title}</h1>
              <p className="text-white text-sm">{one.value}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Info;
