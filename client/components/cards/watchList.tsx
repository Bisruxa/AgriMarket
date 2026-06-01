'use client'
import { useState } from "react";
import {  Sprout, ChevronRight, ChevronLeft } from 'lucide-react';

function WatchList() {
  const [crops] = useState([
    { name: 'Maize', price: '32',  demand: 'High', yield: '50', icon: '🌽' },
    { name: 'Teff', price: '85', demand: 'Medium', yield: '40', icon: '🌾' },
    { name: 'Cabbage', price: '12',  demand: 'Low', yield: '10', icon: '🥬' },
    { name: 'Potato', price: '25',  demand: 'High', yield: '45', icon: '🥔' },
    { name: 'Tomto', price: '18', demand: 'Low', yield: '5', icon: '🍅' },
    { name: 'Onion', price: '22', demand: 'Medium', yield: '15', icon: '🧅' },
    { name: 'Carrot', price: '28',  demand: 'High', yield: '20', icon: '🥕' },
    { name: 'Lentil', price: '45',  demand: 'Medium', yield: '12', icon: '🫘' },
  ]);

  const getDemandColor = (demand: string) => {
    switch(demand) {
      case 'High': return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'Medium': return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'Low': return 'text-rose-700 bg-rose-50 border border-rose-200';
      default: return 'text-gray-700 bg-gray-50 border border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#5B8C51]/20 flex flex-col hover:shadow-lg transition-all overflow-hidden max-w-full w-full">
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-white to-[#F5F9F5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#5B8C51]/10 rounded-lg">
              <Sprout size={20} className="text-[#5B8C51]" />
            </div>
            <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
              Top Profitable Crops
            </h3>
          </div>
          <span className="text-xs text-[#5B8C51] bg-[#5B8C51]/10 px-2 py-1 rounded-full">
            This Season
          </span>
        </div>
        
        <div className="hidden sm:grid grid-cols-5 gap-2 mt-4 text-xs font-medium text-gray-500 px-1">
          <div className="col-span-1">Crop</div>
          <div className="col-span-1 text-right">Price (Birr)</div>
          <div className="col-span-1 text-right">Demand</div>
          <div className="col-span-1 text-right">Yield/ha</div>
        </div>

        <div className="sm:hidden relative mt-2">
          <div className="flex justify-between items-center text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <ChevronLeft size={12} /> Scroll
            </span>
            <span className="flex items-center gap-1">
              Scroll <ChevronRight size={12} />
            </span>
          </div>
          <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>
      </div>

      <div className="relative">
        <div className="block sm:hidden overflow-x-auto scrollbar-hide p-3 pt-1">
          <div className="inline-flex gap-3 min-w-full pb-1">
            {crops.map((crop, index) => (
              <div 
                key={index}
                className="shrink-0 w-64 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:border-[#5B8C51]/30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{crop.icon}</span>
                  <div>
                    <span className="font-bold text-gray-800">{crop.name}</span>
                    <span className="text-xs text-gray-400 block mt-0.5">ID: CR-{index + 101}</span>
                  </div>
                </div>
                
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Current Price</span>
                    <span className="font-semibold text-gray-800">{crop.price} Br</span>
                  </div>
                 
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Demand</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDemandColor(crop.demand)}`}>
                      {crop.demand}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Yield/ha</span>
                    <span className="font-bold text-[#5B8C51]">{crop.yield} kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden sm:block flex-1 overflow-y-auto scrollbar-hide p-3 space-y-1 max-h-[400px]">
          {crops.map((crop, index) => (
            <div 
              key={index}
              className="grid grid-cols-5 gap-2 items-center py-2.5 px-3 rounded-lg hover:bg-[#F5F9F5] transition-colors group border border-transparent hover:border-[#5B8C51]/20"
            >
              <div className="col-span-1 flex items-center gap-2">
                <span className="text-xl group-hover:scale-110 transition-transform">{crop.icon}</span>
                <span className="font-medium text-gray-800">{crop.name}</span>
              </div>

              <div className="col-span-1 text-right">
                <span className="font-semibold text-gray-800">{crop.price}</span>
                <span className="text-xs text-gray-400 ml-1">Br</span>
              </div>


              <div className="col-span-1 text-right">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDemandColor(crop.demand)}`}>
                  {crop.demand}
                </span>
              </div>

              <div className="col-span-1 text-right">
                <span className="font-semibold text-[#5B8C51]">{crop.yield}</span>
                <span className="text-xs text-gray-400 ml-1">kg</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-xs text-gray-500">
        <span>{crops.length} crops monitored</span>
        <span className="flex items-center gap-1 text-[#5B8C51]">
          <Sprout size={12} />
          Updated live
        </span>
      </div>
    </div>
  );
}

export default WatchList;