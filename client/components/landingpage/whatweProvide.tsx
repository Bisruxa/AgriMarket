'use client'
import React from 'react';
import Image from 'next/image';
import { useTranslations } from "@/components/hooks/useTranlations";
import { useLanguage } from "@/app/context/LanguageContext";
const BenefitsSection = () => {
  const t = useTranslations();
  const { language } = useLanguage();
  const benefits = [
    {
      title: t.benefits.items.ai,
      description: language === 'en'
        ? "Get personalized crop recommendations and price forecasts powered by advanced machine learning tailored for Ethiopian agriculture."
        : "የኢትዮጵያ ግብርና የተገጠመ የላቀ ማሽን ማሰብ ስልተ ቀመሮች በግለት የአዝፍሮ ምክሮችን እና የዋጋ ትንበያዎችን ያግኙ።"
    },
    {
      title: t.benefits.items.market,
      description: language === 'en'
        ? "Access real-time market data and historical trends to maximize your selling strategy."
        : "በቀጥታ የገበያ ውሂብ እና ታሪካዊ አዝማሚያዎችን ይድረሱ።"
    },
    {
      title: t.benefits.items.traders,
      description: language === 'en'
        ? "Connect directly with verified traders and eliminate unnecessary middlemen."
        : "ከተረጋገጡ ነጋዴዎች ጋር በቀጥታ ይገናኙ።"
    },
    {
      title: t.benefits.items.secure,
      description: language === 'en'
        ? "Enterprise-grade security protects your data and transactions."
        : "ውሂብዎ እና ግብይቶችዎ በከፍተኛ ደረጃ ደህንነት የተጠበቀ ነው።"
    },
    {
      title: t.benefits.items.weather,
      description: language === 'en'
        ? "Receive region-specific planting advice based on soil and weather conditions."
        : "በአየር ንብረት እና በምጣድ ጥራት ላይ የተመሰረተ የመትከል ምክር ይቀበሉ።"
    },
    {
      title: t.benefits.items.dataDriven,
      description: language === 'en'
        ? "Turn guesswork into confidence with data-driven agricultural insights."
        : "በማስረጃ ላይ የተመሰረቱ ግንዛቤዎችን ይጠቀሙ።"
    }
  ];

  const leftSideBenefits = benefits.slice(0, 3);
  const bottomBenefits = benefits.slice(3);
  return (
    <section className={`bg-[#e33f3e] text-white pt-10 pb-30 px-6 md:px-12 ${language === 'am' ? 'amharic' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start mb-8">
          <div className="relative border-10 border-[#e4e5ba] w-full h-105">
            <div className="absolute inset-0 bg-black opacity-30 z-10"></div>
            <Image
              src="/market2.jpg"
              alt="Why Choose AgriMarket"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-1">
             <h2 className="text-4xl md:text-5xl font-extrabold text-black leading-tight mb-8 text-center">
            Why Choose <br />
            <span className="text-[#e4e5ba]">AgriMarket?</span>
          </h2>
            {leftSideBenefits.map((item, index) => (
              <div key={index}>
                <h3 className="text-xl text-black font-bold mb-2">
                  {item.title}
                </h3>
                <p className="text-black leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full mt-15">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bottomBenefits.map((item, index) => (
              <div key={index} className="text-center">
                <h3 className="text-xl text-black font-bold mb-2">
                  {item.title}
                </h3>
                <p className="text-black leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;