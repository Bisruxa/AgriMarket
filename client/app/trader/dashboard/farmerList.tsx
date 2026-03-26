import React from "react";
import { MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
const FarmerList = () => {
  return (
    <div className="flex justify-between ">
      <div className="items-center space-y-1.5 flex flex-col">
        <h1 className="font-bold text-lg">Alemu Tadese</h1>
        <div className="flex items-center space-x-1 text-xs opacity-55">
          <MapPin size={10} />
          <span>ARSI, OROMIA</span>
        </div>
      </div>
      <div className="items-center space-y-1.5 flex flex-col">
        <h1 className="font-bold text-lg">Teff</h1>
        <h2 className="text-xs opacity-55">CROP</h2>
      </div>
      <div className="items-center space-y-1.5 flex flex-col">
        <h1 className="font-bold text-lg">45 qt</h1>
        <h2 className="text-xs opacity-55">IN QUNTAL</h2>
      </div>
      <div className="items-center space-y-1.5 flex flex-col">
        <h1 className="font-bold text-lg">4200</h1>
        <h2 className="text-xs opacity-55">BIRR</h2>
      </div>
      <div className="flex items-center">
        <Button className="bg-white text-black cursor-pointer border-2 border-[#2A5A2A] hover:bg-white">
          <Phone className="text-[#2A5A2A] " size={17} />
          Contact
        </Button>
      </div>
    </div>
  );
};

export default FarmerList;
