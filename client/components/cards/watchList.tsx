'use client'
import { useState } from "react";
import { TrendingUp, TrendingDown, Sprout } from 'lucide-react';

function WatchList() {
  const [crops] = useState([
    { name: 'Maize', price: '32', change: '+24', demand: 'High', yield: '50', icon: '🌽' },
    { name: 'Teff', price: '85', change: '+14', demand: 'Medium', yield: '40', icon: '🌾' },
    { name: 'Cabbage', price: '12', change: '-4', demand: 'Low', yield: '10', icon: '🥬' },
    { name: 'Potato', price: '25', change: '+9', demand: 'High', yield: '45', icon: '🥔' },
    { name: 'Tomato', price: '18', change: '-3', demand: 'Low', yield: '5', icon: '🍅' },
    { name: 'Tomato', price: '18', change: '-3', demand: 'Low', yield: '5', icon: '🍅' },
    { name: 'Tomato', price: '18', change: '-3', demand: 'Low', yield: '5', icon: '🍅' },
    { name: 'Tomato', price: '18', change: '-3', demand: 'Low', yield: '5', icon: '🍅' },
  ]);

  const getDemandColor = (demand: string) => {
    switch(demand) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#5B8C51]/30 flex flex-col hover:shadow-sm transition-all overflow-hidden md:w-183 max-w-full w-full">
      {/* Header - Fixed on mobile */}
      <div className="p-3 sm:p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Sprout size={18} className="text-[#5B8C51] shrink-0" />
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
            Top Profitable Crops
          </h3>
        </div>
        
        {/* Column Headers - Hidden on mobile, shown on tablet+ */}
        <div className="hidden sm:grid grid-cols-5 gap-1 mt-2 text-xs text-gray-500 font-medium">
          <div className="col-span-1">Crop</div>
          <div className="col-span-1 text-right">Price</div>
          <div className="col-span-1 text-right">Change</div>
          <div className="col-span-1 text-right">Demand</div>
          <div className="col-span-1 text-right">Yield</div>
        </div>

        {/* Mobile scroll hint */}
        <div className="sm:hidden flex justify-end mt-1">
          <span className="text-[10px] text-gray-400 animate-pulse">
            ← Scroll horizontally →
          </span>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="relative">
        {/* Mobile Horizontal Scroll */}
        <div className="block sm:hidden overflow-x-auto scrollbar-hide p-2">
          <div className="inline-flex gap-2 min-w-full">
            {crops.map((crop, index) => (
              <div 
                key={index}
                className="shrink-0 w-64 bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
              >
                {/* Mobile Card Layout */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{crop.icon}</span>
                  <span className="font-bold text-gray-800">{crop.name}</span>
                </div>
                
                <div className="space-y-2">
                  {/* Price Row */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Price</span>
                    <span className="font-medium text-gray-800">{crop.price} Br</span>
                  </div>
                  
                  {/* Change Row */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Change</span>
                    <span className={`flex items-center gap-1 font-medium ${
                      crop.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {crop.change.startsWith('+') ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      {crop.change}%
                    </span>
                  </div>
                  
                  {/* Demand Row */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Demand</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDemandColor(crop.demand)}`}>
                      {crop.demand}
                    </span>
                  </div>
                  
                  {/* Yield Row */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Yield</span>
                    <span className="font-medium text-gray-800">{crop.yield} kg/ha</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Vertical Scroll */}
        <div className="hidden sm:block flex-1 overflow-y-auto scrollbar-hide p-2 sm:p-3 space-y-1.5 max-h-96">
          {crops.map((crop, index) => (
            <div 
              key={index}
              className="grid grid-cols-5 gap-1 items-center py-1.5 px-1 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
            >
              {/* Crop Name with Icon */}
              <div className="col-span-1 flex items-center gap-1">
                <span className="text-sm sm:text-base">{crop.icon}</span>
                <span className="font-medium text-gray-800 truncate">{crop.name}</span>
              </div>

              {/* Price */}
              <div className="col-span-1 text-right font-medium text-gray-700">
                {crop.price}
                <span className="text-[10px] text-gray-500 ml-0.5">Br</span>
              </div>

              {/* Change Percentage with Icon */}
              <div className={`col-span-1 text-right font-medium flex items-center justify-end gap-0.5
                ${crop.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}
              >
                {crop.change.startsWith('+') ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {crop.change}%
              </div>

              {/* Demand Badge */}
              <div className="col-span-1 text-right">
                <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full ${getDemandColor(crop.demand)}`}>
                  {crop.demand}
                </span>
              </div>

              {/* Yield */}
              <div className="col-span-1 text-right font-medium text-gray-700">
                {crop.yield}
                <span className="text-[10px] text-gray-500 ml-0.5">kg/ha</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile scroll indicators */}
      <div className="sm:hidden flex justify-center gap-1 p-2">
        <div className="w-1 h-1 bg-[#5B8C51] rounded-full"></div>
        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
}

export default WatchList;