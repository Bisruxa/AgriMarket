'use client'
import React from 'react';
import { Brain, TrendingUp, Users, Shield, Zap, Smartphone, Globe, BarChart } from "lucide-react";
import { useTranslations } from "@/components/hooks/useTranlations";
import { useLanguage } from "@/app/context/LanguageContext";

const BenefitsSection = () => {
  const t = useTranslations();
  const { language } = useLanguage();
  
  // Icons stay the same for both languages
  const benefits = [
    { icon: <Brain size={48} className="text-[#5B8C51]" /> },
    { icon: <TrendingUp size={48} className="text-[#5B8C51]" /> },
    { icon: <Users size={48} className="text-[#5B8C51]" /> },
    { icon: <Shield size={48} className="text-[#5B8C51]" /> },
    { icon: <Smartphone size={48} className="text-[#5B8C51]" /> },
    { icon: <Globe size={48} className="text-[#5B8C51]" /> },
    { icon: <Zap size={48} className="text-[#5B8C51]" /> },
    { icon: <BarChart size={48} className="text-[#5B8C51]" /> },
  ];

  // Get titles and descriptions from translations
  const benefitTitles = [
    t.benefits.items.ai,
    t.benefits.items.market,
    t.benefits.items.traders,
    t.benefits.items.secure,
    t.benefits.items.userFriendly,
    t.benefits.items.weather,
    t.benefits.items.alerts,
    t.benefits.items.dataDriven
  ];

  return (
    <section className={`py-16 px-4 md:py-20 md:px-8 text-white bg-linear-to-br from-[#0A1F0A] to-[#1A3C1A] ${language === 'am' ? 'amharic' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-[28px] font-extrabold text-center mb-4 bg-linear-to-r from-[#5B8C51] to-[#3A6B31] bg-clip-text text-transparent">
          {t.benefits.title}
        </h2>
        
        <p className="text-gray-300 text-center text-[14px] mb-12 max-w-3xl mx-auto">
          {t.benefits.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="group relative bg-[#1A291A] p-6 rounded-xl border border-[#2A3F2A] transition-all duration-300 hover:border-[#5B8C51] hover:shadow-2xl hover:shadow-[#5B8C51]/20 cursor-pointer shadow-lg hover:-translate-y-2"
            >
              {/* linear overlay on hover */}
              <div className="absolute inset-0 bg-linear-to-br from-[#5B8C51]/0 to-[#5B8C51]/0 group-hover:from-[#5B8C51]/5 group-hover:to-[#3A6B31]/5 rounded-xl transition-all duration-300"></div>
              
              <div className="relative z-10">
                <div className="transition-transform duration-300 mb-4 flex justify-center group-hover:scale-110">
                  <div className="p-3 bg-[#5B8C51]/10 rounded-lg group-hover:bg-[#5B8C51]/20 transition-colors duration-300">
                    {item.icon}
                  </div>
                </div>
                
                <h3 className="text-[20px] font-bold mb-3 text-white group-hover:text-[#A3D9A5] transition-colors duration-300">
                  {benefitTitles[index]}
                </h3>
                
                <p className="text-gray-300 text-sm leading-relaxed text-[14px]">
                  {language === 'en' ? 
                    [
                      "Get personalized crop recommendations and price forecasts powered by advanced machine learning algorithms tailored for Ethiopian agriculture.",
                      "Access real-time market data and historical trends to make informed decisions about when to sell your crops for maximum profit.",
                      "Connect directly with verified traders across Ethiopia, eliminating middlemen and ensuring fair prices for your produce.",
                      "Your data and transactions are protected with enterprise-grade security, giving you peace of mind while using our platform.",
                      "Designed specifically for Ethiopian farmers with an intuitive interface available in Amharic and English for easy navigation.",
                      "Receive planting advice based on soil quality, weather forecasts, and climate conditions specific to your region.",
                      "Get instant notifications about price changes, weather warnings, and optimal planting/selling times directly to your phone.",
                      "Transform guesswork into confidence with evidence-based insights that improve crop yields and farm profitability."
                    ][index] :
                    [
                      "የኢትዮጵያ ግብርና የተገጠመ የላቀ ማሽን ማሰብ ስልተ ቀመሮች በግለት የአዝፍሮ ምክሮችን እና የዋጋ ትንበያዎችን ያግኙ።",
                      "በቀጥታ የገበያ ውሂብ እና ታሪካዊ አዝማሚያዎችን ይድረሱ እና ምርቶችዎን ከፍተኛ ትርፍ ለማግኘት መቼ እንደሚሸጡ በመረጃ ላይ የተመሰረተ ውሳኔ ያድርጉ።",
                      "በኢትዮጵያ ሙሉ በሙሉ ከተረጋገጡ ነጋዴዎች ጋር በቀጥታ ይገናኙ፣ መካከለኛዎችን ያስወግዱ እና ለምርቶችዎ ፍትሃዊ ዋጋ ያረጋግጡ።",
                      "ውሂብዎ እና ግብይቶችዎ በኢንተርፕራይዝ ደረጃ ደህንነት የተጠበቀ ነው፣ የእኛን መድረክ በሚጠቀሙበት ጊዜ አእምሮ ሰላም ይሰጥዎታል።",
                      "ለኢትዮጵያ ገበሬዎች በተለይ የተነደፈ፣ በአማርኛ እና በእንግሊዝኛ ለቀላል አሰሳ የሚገኝ ተፈጥሯዊ በይነገጽ ያለው።",
                      "በምጣድ ጥራት፣ የአየር ንብረት ትንበያዎች እና የአየር ጠባይ ሁኔታዎች ላይ በመመስረት የመትከል ምክር ይቀበሉ።",
                      "ስለ የዋጋ ለውጦች፣ የአየር ንብረት ማንቂያዎች እና ጥሩ የመትከል/ሽያጭ ጊዜዎች በቀጥታ ወደ ስልክዎ ፈጣን ማንቂያዎችን ያግኙ።",
                      "የአዝፍሮ ምርት እና የግብርና ትርፋማነትን የሚያሻሽሉ በማስረጃ ላይ የተመሰረቱ ግንዛቤዎችን እንዲጨምሩ የሚያደርጉ ግምቶችን ወደ በራስ መተማመን ይቀይሩ።"
                    ][index]
                  }
                </p>
                
                {/* Learn more arrow */}
                <div className="mt-4 flex items-center text-[#5B8C51] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-medium">
                    {language === 'en' ? 'Learn more' : 'ተጨማሪ ይወቁ'}
                  </span>
                  <svg 
                    className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;