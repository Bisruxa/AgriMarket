'use client';

import { useState } from "react";
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslations } from "../hooks/useTranlations";
import { useLanguage } from "@/app/context/LanguageContext";

function WatchList() {
  const t = useTranslations();
  const { language } = useLanguage();
  const wl = t.dashboard.watchList;

  const [crops] = useState([
    { name: 'Maize', price: '32', demandKey: 'High' as const, yield: '50' },
    { name: 'Teff', price: '85', demandKey: 'Medium' as const, yield: '40' },
    { name: 'Cabbage', price: '12', demandKey: 'Low' as const, yield: '10' },
    { name: 'Potato', price: '25', demandKey: 'High' as const, yield: '45' },
    { name: 'Tomato', price: '18', demandKey: 'Low' as const, yield: '5' },
    { name: 'Onion', price: '22', demandKey: 'Medium' as const, yield: '15' },
    { name: 'Carrot', price: '28', demandKey: 'High' as const, yield: '20' },
    { name: 'Lentil', price: '45', demandKey: 'Medium' as const, yield: '12' },
  ]);

  const demandLabel = (key: 'High' | 'Medium' | 'Low') => {
    if (key === 'High') return wl.demandHigh;
    if (key === 'Medium') return wl.demandMedium;
    return wl.demandLow;
  };

  const getDemandColor = (key: 'High' | 'Medium' | 'Low') => {
    switch (key) {
      case 'High': return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'Medium': return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'Low': return 'text-rose-700 bg-rose-50 border border-rose-200';
      default: return 'text-gray-700 bg-gray-50 border border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-md border border-[#5B8C51]/20 flex flex-col hover:shadow-lg transition-all overflow-hidden max-w-full w-full ${language === 'am' ? 'amharic' : ''}`}>
      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-white to-[#F5F9F5]">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
            {wl.title}
          </h3>
          <span className="text-xs text-[#5B8C51] bg-[#5B8C51]/10 px-2 py-1 rounded-full">
            {wl.season}
          </span>
        </div>

        <div className="hidden sm:grid grid-cols-5 gap-2 mt-4 text-xs font-medium text-gray-500 px-1">
          <div className="col-span-1">{wl.crop}</div>
          <div className="col-span-1 text-right">{wl.price}</div>
          <div className="col-span-1 text-right">{wl.demand}</div>
          <div className="col-span-1 text-right">{wl.yield}</div>
        </div>

        <div className="sm:hidden relative mt-2">
          <div className="flex justify-between items-center text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <ChevronLeft size={12} /> {wl.scroll}
            </span>
            <span className="flex items-center gap-1">
              {wl.scroll} <ChevronRight size={12} />
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
                <div className="mb-3">
                  <span className="font-bold text-gray-800">{crop.name}</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{wl.price}</span>
                    <span className="font-semibold text-gray-800">{crop.price} Br</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{wl.demand}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDemandColor(crop.demandKey)}`}>
                      {demandLabel(crop.demandKey)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{wl.yield}</span>
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
              className="grid grid-cols-5 gap-2 items-center py-2.5 px-3 rounded-lg hover:bg-[#F5F9F5] transition-colors border border-transparent hover:border-[#5B8C51]/20"
            >
              <div className="col-span-1">
                <span className="font-medium text-gray-800">{crop.name}</span>
              </div>

              <div className="col-span-1 text-right">
                <span className="font-semibold text-gray-800">{crop.price}</span>
                <span className="text-xs text-gray-400 ml-1">Br</span>
              </div>

              <div className="col-span-1 text-right">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDemandColor(crop.demandKey)}`}>
                  {demandLabel(crop.demandKey)}
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
    </div>
  );
}

export default WatchList;
