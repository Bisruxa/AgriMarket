'use client'
import { Sprout, CloudSun, TrendingUp, DollarSign } from 'lucide-react';
import { useTranslations } from '../hooks/useTranlations';

const FarmingBasics = () => {
  const t = useTranslations()
  const farmingBasics = [
  {
    icon: <Sprout size={40} className="text-[#5B8C51]" />,
  },
  {
   
    icon: <CloudSun size={40} className="text-[#5B8C51]" />,
  },
  {
   
    icon: <TrendingUp size={40} className="text-[#5B8C51]" />,
  },
  {
    
    icon: <DollarSign size={40} className="text-[#5B8C51]" />,
  },
];
  const basicTitles =[
  t.farmingBasics.items.cropSelection,
  t.farmingBasics.items.weatherAwareness,
  t.farmingBasics.items.marketTiming,
  t.farmingBasics.items.profitOptimization
];
const basicDescriptions=[
  t.farmingBasics.itemDescriptions.cropSelection,
  t.farmingBasics.itemDescriptions.weatherAwareness,
  t.farmingBasics.itemDescriptions.marketTiming,
  t.farmingBasics.itemDescriptions.profitOptimization
]

  return (
    <section className="bg-linear-to-b from-white to-[#F0F9F0] py-16 md:py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-[28px] font-bold text-center mb-12 bg-linear-to-r from-[#5B8C51] to-[#3A6B31] bg-clip-text text-transparent">
          {t.farmingBasics.title}
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {farmingBasics.map((item, index) => (
            <div
              key={index}
              className="group p-6 md:p-8 bg-white rounded-2xl border border-gray-200 hover:border-[#5B8C51] transition-all duration-300 hover:shadow-2xl hover:shadow-[#5B8C51]/20 hover:-translate-y-2"
            >
              <div className="flex items-start gap-4 md:gap-6">
                <div className="shrink-0 p-3 bg-[#5B8C51]/10 rounded-xl group-hover:bg-[#5B8C51]/20 transition-colors duration-300">
                  <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-[20px] md:text-xl font-bold mb-2 md:mb-3 text-gray-800 group-hover:text-[#5B8C51] transition-colors duration-300">
                   {basicTitles[index]}
                  </h3>
                  <p className="text-gray-600 text-[14px] md:text-base leading-relaxed">
                  {basicDescriptions[index]}
                  </p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="mt-6 flex items-center">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-linear-to-r from-[#5B8C51] to-[#3A6B31] h-2 rounded-full transition-all duration-500 group-hover:w-full"
                    style={{ width: `${(index + 1) * 25}%` }}
                  ></div>
                </div>
                <span className="ml-3 text-xs text-gray-500 font-medium">
                  {index + 1}/4
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Call to action */}
        <div className="mt-12 text-center">
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto text-[14px]">
          {t.farmingBasics.ctaDescription}
          </p>
          <button className="px-8 py-3 bg-linear-to-r from-[#5B8C51] to-[#3A6B31] text-white font-semibold rounded-full hover:from-[#6DA562] hover:to-[#4A7B41] transition-all duration-300 shadow-lg text-[14px] transform hover:scale-105">
  {t.farmingBasics.cta}
          </button>
        </div>
      </div>
    </section>
  );
};

export default FarmingBasics;