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
    <section className="bg-[#668B57] py-16 md:py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-[35px] font-extrabold text-center mb-4 text-black">
          {t.faq.title}
        </h2>
        
        <p className="text-[#e4e5ba]/90 text-center text-[14px] mb-12 max-w-2xl mx-auto">
         {t.faq.description}
        </p>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={index}
              className={`border border-[#2A3F2A] bg-[#2A3F2A] transition-all duration-300 overflow-hidden rounded-lg`}
            >
              <button
                className="w-full flex justify-between items-center p-6 text-left cursor-pointer hover:bg-[#1E2F1E] transition-colors duration-300"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-[#e4e5ba] font-bold text-[14px] bg-[#668B57] w-6 h-6 rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <h3 className="text-[14px] md:text-xl capitalize font-semibold text-[#e4e5ba]">
                    {question}
                  </h3>
                </div>
                
                <div className="text-[#e4e5ba]">
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
                <div className="pt-4 border-t border-[#668B57]">
                  <p className="text-[#e4e5ba] leading-relaxed text-[14px]">
                    {answers[index]}
                  </p>
                  
                   {index === 0 && (
                    <div className="mt-4 p-3 bg-[#1E2F1E] rounded-lg">
                      <p className="text-sm text-[#e4e5ba]">
                        <span className="font-medium text-[#FF6B6B]">
                          {language === 'en' ? 'Note:' : 'ማስታወሻ:'}
                        </span>{" "}
                        {language === 'en' 
                          ? 'Premium features include advanced analytics and priority trader connections.' 
                          : 'ጥራት ባህሪያት የላቀ ትንተና እና ቅድሚያ ነጋዴ ግንኙነቶችን ያካትታሉ።'}
                      </p>
                    </div>
                  )}                  
                  {index === 2 && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-[#e4e5ba]">
                      <div className="w-2 h-2 rounded-full bg-[#e23f3e]"></div>
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