'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '../hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';

const INTERVAL_MS = 5000;

export default function FarmFactsCarousel() {
  const t = useTranslations();
  const { language } = useLanguage();
  const { badge, facts } = t.dashboard.farmFacts;
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [language]);

  useEffect(() => {
    if (facts.length <= 1) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % facts.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [facts.length]);

  const goTo = (index: number) => setActive(index);

  return (
    <div
      className={`flex h-32 sm:h-36 flex-col rounded-lg border border-[#5B8C51]/30 bg-white p-3 sm:p-4 shadow-sm transition-shadow hover:shadow-md ${language === 'am' ? 'amharic' : ''}`}
    >
      <span className="mb-2 w-fit rounded-full bg-[#5B8C51]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2A5A2A]">
        {badge}
      </span>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {facts.map((fact, index) => (
          <p
            key={index}
            aria-hidden={index !== active}
            className={`absolute inset-x-0 top-0 text-xs sm:text-sm leading-relaxed text-gray-700 transition-opacity duration-700 ease-in-out ${
              index === active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {fact}
          </p>
        ))}
      </div>

      <div className="mt-2 flex justify-center gap-1.5">
        {facts.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Fact ${index + 1}`}
            onClick={() => goTo(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === active ? 'w-5 bg-[#5B8C51]' : 'w-1.5 bg-gray-300 hover:bg-[#5B8C51]/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
