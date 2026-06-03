'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ReceiptText,
  LineChart,
  Loader2,
  Sprout,
  ArrowUpRight,
} from 'lucide-react';
import { useTranslations } from '../hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';
import { useFarms } from '@/components/hooks/useFarms';
import { useMarketPulse } from '@/components/hooks/useMarketPulse';
import { pricesApi } from '@/lib/api';

const QUICK_LINKS = [
  { href: '/farmer/trends', icon: BarChart3, labelKey: 'trends' as const },
  { href: '/farmer/price-forecast', icon: LineChart, labelKey: 'priceForecast' as const },
  { href: '/farmer/cropdetail', icon: ReceiptText, labelKey: 'cropRecommendations' as const },
];

const SNAPSHOT_CROPS = ['Teff', 'Maize', 'Wheat', 'Barley'];

type SnapshotItem = {
  name: string;
  price: number | null;
  trendPercent: number | null;
};

function WatchList() {
  const t = useTranslations();
  const { language } = useLanguage();
  const wl = t.dashboard.watchList;
  const sidebar = t.sidebar;

  const { data: farmsData } = useFarms();
  const farmCount = farmsData?.count ?? 0;
  const firstRegion = farmsData?.farms?.[0]?.region ?? undefined;

  const { data: pulse, isLoading: pulseLoading } = useMarketPulse(farmCount);

  const [snapshot, setSnapshot] = useState<SnapshotItem[]>([]);
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  const personalizedCrops = pulse?.items?.slice(0, 6) ?? [];
  const hasPersonalizedData = personalizedCrops.length > 0;
  const showFarmReady = farmCount > 0 && !hasPersonalizedData;

  useEffect(() => {
    if (farmCount === 0 || hasPersonalizedData) {
      setSnapshot([]);
      return;
    }

    let cancelled = false;
    const loadSnapshot = async () => {
      setSnapshotLoading(true);
      const results: SnapshotItem[] = [];

      for (const crop of SNAPSHOT_CROPS) {
        try {
          const res = await pricesApi.getTrends({
            cropName: crop,
            region: firstRegion || undefined,
            limit: 6,
          });
          if (!res.success || !res.data?.length) {
            results.push({ name: crop, price: null, trendPercent: null });
            continue;
          }
          const rows = res.data;
          const latest = rows[rows.length - 1];
          const recent = rows.slice(-3);
          const recentAvg =
            recent.reduce((s, r) => s + r.avgPrice, 0) / Math.max(recent.length, 1);
          const trendPercent = recentAvg
            ? Number((((latest.avgPrice - recentAvg) / recentAvg) * 100).toFixed(1))
            : null;
          results.push({
            name: crop,
            price: latest.avgPrice,
            trendPercent,
          });
        } catch {
          results.push({ name: crop, price: null, trendPercent: null });
        }
      }

      if (!cancelled) {
        setSnapshot(results.filter((r) => r.price != null));
        setSnapshotLoading(false);
      }
    };

    void loadSnapshot();
    return () => {
      cancelled = true;
    };
  }, [farmCount, firstRegion, hasPersonalizedData]);

  const loading = pulseLoading || (showFarmReady && snapshotLoading);

  const labelFor = (key: (typeof QUICK_LINKS)[number]['labelKey']) => {
    if (key === 'trends') return sidebar.trends;
    if (key === 'priceForecast') return sidebar.priceForecast;
    return sidebar.cropRecommendations;
  };

  const renderCropCard = (
    crop: {
      cropName: string;
      region?: string;
      latestPrice?: number;
      trendPercent?: number;
      score?: number;
      hasPriceData?: boolean;
    },
    index: number
  ) => {
    const trend = crop.trendPercent ?? 0;
    const isUp = trend >= 0;
    const TrendIcon = isUp ? TrendingUp : TrendingDown;
    const hasPrice = crop.hasPriceData !== false && crop.latestPrice != null;

    return (
      <Link
        key={`${crop.cropName}-${index}`}
        href={`/farmer/trends?crop=${encodeURIComponent(crop.cropName.toLowerCase())}`}
        className="flex items-center justify-between gap-3 border-b border-[#5B8C51]/10 py-3 last:border-0"
      >
        <div className="min-w-0">
          <p className="font-medium capitalize text-gray-800">{crop.cropName}</p>
          {crop.region && <p className="text-xs text-gray-400">{crop.region}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {hasPrice && crop.trendPercent != null && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                isUp ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              <TrendIcon className="h-3 w-3" />
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          <div className="text-right">
            <p className="font-semibold text-[#2A5A2A]">
              {hasPrice ? crop.latestPrice!.toFixed(0) : '—'}
            </p>
            <p className="text-xs text-gray-400">{hasPrice ? wl.perKg : wl.noPriceYet}</p>
          </div>
        </div>
      </Link>
    );
  };

  const renderSnapshotCard = (item: SnapshotItem, index: number) => {
    const trend = item.trendPercent ?? 0;
    const isUp = trend >= 0;

    return (
      <Link
        key={`${item.name}-${index}`}
        href={`/farmer/trends?crop=${encodeURIComponent(item.name.toLowerCase())}`}
        className="flex items-center justify-between border-b border-[#5B8C51]/10 py-2.5 last:border-0"
      >
        <span className="font-medium text-gray-800">{item.name}</span>
        <div className="flex items-center gap-3">
          {item.trendPercent != null && (
            <span className={`text-xs font-medium ${isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isUp ? '+' : ''}{trend.toFixed(1)}%
            </span>
          )}
          <span className="font-semibold text-[#2A5A2A]">
            {item.price != null ? item.price.toFixed(0) : '—'}
            <span className="ml-1 text-xs font-normal text-gray-400">{wl.perKg}</span>
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className={`px-4 sm:px-5 pb-4 ${language === 'am' ? 'amharic' : ''}`}>
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2>{wl.title}</h2>
          <p className="text-muted mt-0.5">{farmCount > 0 ? wl.subtitleWithFarms : wl.subtitle}</p>
        </div>
        {!loading && pulse?.hasData && hasPersonalizedData && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2A5A2A]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {wl.livePulse}
          </span>
        )}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, icon: Icon, labelKey }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#5B8C51]/15 bg-white/90 px-4 py-3.5 shadow-sm transition-colors hover:border-[#5B8C51]/30 hover:bg-[#F5F9F5]"
          >
            <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-[#2A5A2A]">
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{labelFor(labelKey)}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-[#5B8C51]/60" />
          </Link>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#5B8C51]/20 bg-white/40 py-10 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin text-[#5B8C51]" />
          {wl.loading}
        </div>
      )}

      {!loading && hasPersonalizedData && (
        <div className="border-t border-[#5B8C51]/15">
          {personalizedCrops.map((crop, index) => renderCropCard(crop, index))}
        </div>
      )}

      {!loading && showFarmReady && (
        <>
          <div className="mb-5 border-b border-[#5B8C51]/15 pb-4">
            <p className="font-medium text-gray-800">{wl.farmReadyTitle}</p>
            <p className="mt-1 text-sm text-gray-500">{wl.farmReadyBody}</p>
            <Link
              href="/farmer/cropdetail"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#2A5A2A] hover:underline"
            >
              {wl.cropRecommendationsCta}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {snapshot.length > 0 && (
            <>
              <p className="mb-2 text-xs text-gray-400">
                {wl.regionalSnapshot}
                {firstRegion ? ` · ${firstRegion}` : ''}
              </p>
              <div>
                {snapshot.map((item, index) => renderSnapshotCard(item, index))}
              </div>
            </>
          )}
        </>
      )}

      {!loading && farmCount === 0 && (
        <div className="relative overflow-hidden rounded-xl border border-dashed border-[#5B8C51]/25 bg-gradient-to-br from-[#F5F9F5] to-white px-5 py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#5B8C51]/10">
            <Sprout className="h-6 w-6 text-[#2A5A2A]" />
          </div>
          <h4 className="font-semibold text-gray-800">{wl.noFarmTitle}</h4>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
            {wl.noFarmBody}
          </p>
          <Link
            href="/farmer/farms?add=1"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#2A5A2A] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1E431E]"
          >
            {wl.addFarmCta}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default WatchList;
