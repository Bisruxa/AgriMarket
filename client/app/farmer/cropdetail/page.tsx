import React from "react";
import { Tag, Hourglass, Award, Calendar, Leaf, MapPin } from 'lucide-react';
import Header from "@/components/common/Header";
import { Button } from "@/components/ui/button";

const CropDetail = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex justify-center items-center flex-1 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#2A5A2A] mb-6 text-center">
            Get Crop Recommendation
          </h2>
          
          <form className="space-y-6">
            {/* Farmland Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 text-[#2A5A2A]" />
                Select Farmland
              </label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A5A2A] focus:border-transparent outline-none bg-white">
                <option value="">Choose a farmland</option>
                <option value="farm1">North Field (15 acres)</option>
                <option value="farm2">South Field (10 acres)</option>
                <option value="farm3">East Field (8 acres)</option>
                <option value="farm4">West Field (12 acres)</option>
              </select>
            </div>

            {/* Season Selection */}
            {/* <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 text-[#2A5A2A]" />
                Select Season
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Spring', 'Summer', 'Fall', 'Winter'].map((season) => (
                  <label key={season} className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-[#2A5A2A] has-[:checked]:bg-green-50">
                    <input 
                      type="radio" 
                      name="season" 
                      value={season.toLowerCase()} 
                      className="text-[#2A5A2A] focus:ring-[#2A5A2A]" 
                    />
                    <span className="text-sm">{season}</span>
                  </label>
                ))}
              </div>
            </div> */}

            {/* Last Crop Planted - Changed to Text Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Leaf className="w-4 h-4 text-[#2A5A2A]" />
                Last Crop Planted
              </label>
              <input 
                type="text" 
                placeholder="e.g., Corn, Wheat, Soybeans"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A5A2A] focus:border-transparent outline-none bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">Enter the name of the last crop you planted in this field</p>
            </div>

            {/* Optional: Additional Info */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Hourglass className="w-4 h-4 text-[#2A5A2A]" />
                Planting Date (Optional)
              </label>
              <input 
                type="date" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A5A2A] focus:border-transparent outline-none bg-white"
              />
            </div>

            {/* Submit Button */}
            <Button className="w-full bg-[#2A5A2A] hover:bg-[#1e441e] text-white py-6 text-lg">
              Get Recommendation
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CropDetail;