import React from "react";
import Image from "next/image"
import WeatherCard from "@/components/Trader/weather";
const Header = () => {
  return (
    <header className="w-full flex mb-5">
      <div className="relative">
        <Image
          width={300}
          height={200}
          className="rounded-tl-lg rounded-bl-lg object-cover h-50"
          src="/farmer.jpg"
          alt="Farmer Image"
          style={{ maxWidth: "100%", height: "auto" }}
        />
        <div className="text-white space-y-3 px-5 pt-15 absolute w-full h-50 bg-black/30 inset-0 rounded-lg">
          <h1 className="text-xs">Welcome</h1>
          <p className="font-bold text-xl opacity-95">
            Glad for having you here
          </p>
        </div>
      </div>
      <div className="flex-2">
        <WeatherCard />
      </div>
    </header>
  );
};

export default Header;
