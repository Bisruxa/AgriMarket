import React from "react";
import Image from "next/image"
import WeatherCard from "@/components/Trader/weather";
const Header = () => {
  return (
    <header className="mb-5 flex w-full flex-col gap-4 lg:flex-row">
      <div className="relative w-full lg:w-[58%]">
        <Image
          width={300}
          height={200}
          className="h-48 w-full rounded-lg object-cover sm:h-56"
          src="/farmer.jpg"
          alt="Farmer Image"
        />
        <div className="absolute inset-0 space-y-2 rounded-lg bg-black/30 px-4 pt-8 text-white sm:px-5 sm:pt-12">
          <h1 className="text-xs sm:text-sm">Welcome</h1>
          <p className="text-lg font-bold opacity-95 sm:text-xl">
            Glad for having you here
          </p>
        </div>
      </div>
      <div className="w-full lg:w-[42%]">
        <WeatherCard />
      </div>
    </header>
  );
};

export default Header;
