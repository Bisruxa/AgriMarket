'use client'
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "../hooks/useTranlations";
import { useLanguage } from "@/app/context/LanguageContext";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<null|number>(null);
  const t = useTranslations()
  const {language} = useLanguage();
  const toggleFAQ = (index:number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const questions = t.faq.questions;
  const answers = t.faq.answers;

  return (
    <section className="bg-linear-to-b from-[#0A1F0A] to-[#142814] py-16 md:py-20 px-4 md:px-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-[28px] font-bold text-center mb-4 bg-linear-to-r from-[#5B8C51] to-[#3A6B31] bg-clip-text text-transparent">
          {t.faq.title}
        </h2>
        
        <p className="text-gray-300 text-center text-[14px] mb-12 max-w-2xl mx-auto">
         {t.faq.description}
        </p>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={index}
              className={`bg-[#1A291A] border border-[#2A3F2A] rounded-xl shadow-lg transition-all duration-300 overflow-hidden ${
                openIndex === index 
                  ? 'border-[#5B8C51] shadow-[#5B8C51]/20' 
                  : 'hover:border-[#5B8C51]/50 hover:shadow-[#5B8C51]/10'
              }`}
            >
              <button
                className="w-full flex justify-between items-center p-6 text-left cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-linear-to-r from-[#5B8C51] to-[#3A6B31] flex items-center justify-center text-[14px]">
                    <span className="text-white font-bold text-[14px]">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-[14px] md:text-xl font-semibold text-white">
                    {question}
                  </h3>
                </div>
                
                <div className="text-[#5B8C51]">
                  {openIndex === index ? (
                    <ChevronUp size={24} />
                  ) : (
                    <ChevronDown size={24} />
                  )}
                </div>
              </button>
              
              <div className={`px-6 transition-all duration-300 overflow-hidden ${
                openIndex === index ? 'pb-6 max-h-96' : 'max-h-0'
              }`}>
                <div className="pt-4 border-t border-[#2A3F2A]">
                  <p className="text-gray-300 leading-relaxed text-[14px]">
                    {answers[index]}
                  </p>
                  
                  {/* Additional context for some FAQs */}
                   {index === 0 && (
                    <div className="mt-4 p-3 bg-[#5B8C51]/10 rounded-lg">
                      <p className="text-sm text-gray-300">
                        <span className="font-medium text-[#A3D9A5]">
                          {language === 'en' ? 'Note:' : 'ማስታወሻ:'}
                        </span>{" "}
                        {language === 'en' 
                          ? 'Premium features include advanced analytics and priority trader connections.' 
                          : 'ጥራት ባህሪያት የላቀ ትንተና እና ቅድሚያ ነጋዴ ግንኙነቶችን ያካትታሉ።'}
                      </p>
                    </div>
                  )}
                  
                  {index === 2 && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-[#5B8C51]"></div>
                      {language === 'en' 
                        ? 'Based on data from Ethiopian Institute of Agricultural Research' 
                        : 'ከኢትዮጵያ የግብርና ምርምር ኢንስቲትዩት ውሂብ ላይ የተመሰረተ'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;