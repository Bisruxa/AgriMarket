'use client';
import { Suspense } from 'react';
import Header from '@/components/common/Header';
import ManageFarms from '@/components/Farmer/ManageFarms';
import { useLanguage } from '@/app/context/LanguageContext';

function FarmsContent() {
  return (
    <>
      <Header />
      <div className="px-1 -pt-12">
        <ManageFarms />
      </div>
    </>
  );
}

export default function FarmsPage() {
  const { language } = useLanguage();

  return (
    <div className={language === 'am' ? 'amharic' : ''}>
      <Suspense
        fallback={
          <div className="flex justify-center py-12 text-sm text-gray-600">
            …
          </div>
        }
      >
        <FarmsContent />
      </Suspense>
    </div>
  );
}
