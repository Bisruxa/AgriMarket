'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, LayoutDashboard, Sprout } from 'lucide-react';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';
import { useAuth } from '@/app/context/UserContext';

function dashboardHref(role?: string) {
  if (role === 'FARMER') return '/farmer/dashboard';
  if (role === 'TRADER') return '/trader/dashboard';
  if (role === 'ADMIN') return '/admin/dashboard';
  return '/signin';
}

export default function NotFound() {
  const t = useTranslations();
  const nf = t.notFound;
  const { language } = useLanguage();
  const { user } = useAuth();
  const dashHref = dashboardHref(user?.role);

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F5F9F5] px-4 py-16 ${language === 'am' ? 'amharic' : ''}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(91,140,81,0.12),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(42,90,42,0.08),transparent_45%)]" />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5B8C51]/15 ring-1 ring-[#5B8C51]/25">
          <Sprout className="h-8 w-8 text-[#2A5A2A]" strokeWidth={1.75} />
        </div>

        <p className="text-7xl font-bold tracking-tight text-[#2A5A2A]/20 sm:text-8xl">404</p>

        <h1 className="mt-2 text-2xl font-bold text-[#0B3D2E] sm:text-3xl">{nf.title}</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-600 sm:text-base">
          {nf.subtitle}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#2A5A2A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1E431E]"
          >
            <Home className="h-4 w-4" />
            {nf.goHome}
          </Link>
          <Link
            href={dashHref}
            className="inline-flex items-center gap-2 rounded-full border border-[#5B8C51]/35 bg-white px-5 py-2.5 text-sm font-medium text-[#2A5A2A] transition-colors hover:bg-[#5B8C51]/10"
          >
            <LayoutDashboard className="h-4 w-4" />
            {nf.goDashboard}
          </Link>
        </div>

        <div className="mt-12 opacity-40">
          <Image src="/corn.avif" alt="" width={32} height={32} className="h-8 w-8" aria-hidden />
        </div>
      </div>
    </div>
  );
}
