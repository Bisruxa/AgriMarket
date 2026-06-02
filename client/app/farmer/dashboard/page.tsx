'use client';
import Link from 'next/link';
import WelcomeCard from '@/components/cards/welcomCard';
import WatchList from '@/components/cards/watchList';
import { Plus } from 'lucide-react';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';

export default function Page() {
  const t = useTranslations();
  const f = t.dashboard.farms;
  const { language } = useLanguage();

  return (
    <>
      <WelcomeCard />
      <div className={`px-4 sm:px-5 mb-5 ${language === 'am' ? 'amharic' : ''}`}>
        <div className="bg-white rounded-xl border border-[#5B8C51]/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
          <div>
            <h3 className="font-semibold text-gray-800">{f.dashboardCardTitle}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{f.dashboardCardSubtitle}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/farmer/farms"
              className="px-4 py-2 rounded-lg border border-[#5B8C51]/40 text-[#2A5A2A] text-sm font-medium hover:bg-[#F5F9F5] transition-colors"
            >
              {f.viewFarms}
            </Link>
          <Link
            href="/farmer/farms?add=1"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2A5A2A] text-white text-sm font-medium hover:bg-[#1E431E] transition-colors"
          >
              <Plus className="h-4 w-4" />
              {f.addFarm}
            </Link>
          </div>
        </div>
      </div>
      <WatchList />
    </>
  );
}
