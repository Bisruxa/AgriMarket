'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Wheat,
  TrendingUp,
  TrendingDown,
  Clock,
  PieChart,
  Loader2,
  Tractor,
} from 'lucide-react';
import { LineGraph } from '@/components/common/LineGraph';
import { BarGraph } from '@/components/common/BarGraph';
import { DataTable } from '@/components/common/Table';
import type { ChartConfig } from '@/components/ui/chart';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslations } from '@/components/hooks/useTranlations';
import {
  pricesApi,
  PriceRecord,
  SalesTimingResult,
  MultiCropProfitabilityResult,
} from '@/lib/api';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CROP_KEYWORDS: Record<string, string[]> = {
  teff: ['Teff (white)', 'Teff (mixed)', 'Teff (black)'],
  barley: ['Barley (white)', 'Barley (mixed)'],
  wheat: ['Wheat (white)', 'Wheat (mixed)'],
  sorghum: ['Sorghum (white)', 'Sorghum (red)', 'Sorghum (yellow)'],
  corn: ['Maize'],
  potato: ['Potato'],
  onion: ['Onion'],
  tomato: ['Tomato'],
  coffee: ['Coffee (beans)', 'Coffee (whole)'],
};

const CROP_LABELS: Record<string, { en: string; am: string }> = {
  teff: { en: 'Teff', am: 'ጤፍ' },
  barley: { en: 'Barley', am: 'ገብስ' },
  wheat: { en: 'Wheat', am: 'ስንዴ' },
  sorghum: { en: 'Sorghum', am: 'ማሽላ' },
  corn: { en: 'Corn/Maize', am: 'በቆሎ' },
  potato: { en: 'Potato', am: 'ስጋር' },
  onion: { en: 'Onion', am: 'ሽንኩርት' },
  tomato: { en: 'Tomato', am: 'ቲማቲም' },
  coffee: { en: 'Coffee', am: 'ቡና' },
};

const COMMON_CROPS = Object.keys(CROP_LABELS);

const REGIONS = [
  'Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'SNNP', 'Somali',
  'Afar', 'Dire Dawa', 'Harari', 'Gambella', 'Benshangul-Gumuz', 'Sidama',
];

function resolveCropKey(input: string): string {
  const raw = input.trim().toLowerCase();
  if (CROP_LABELS[raw]) return raw;
  const match = COMMON_CROPS.find(
    (key) =>
      CROP_LABELS[key].en.toLowerCase() === raw ||
      CROP_LABELS[key].am === input.trim() ||
      (CROP_KEYWORDS[key] || []).some((n) => n.toLowerCase().includes(raw))
  );
  return match ?? raw.replace(/\s+/g, '-');
}

function TrendsPageContent() {
  const { language } = useLanguage();
  const t = useTranslations();
  const tr = t.dashboard.trends;
  const searchParams = useSearchParams();

  const [selectedCrop, setSelectedCrop] = React.useState('teff');
  const [selectedRegion, setSelectedRegion] = React.useState('Addis Ababa');
  const [searchCrop, setSearchCrop] = React.useState('');
  const [priceRecords, setPriceRecords] = React.useState<PriceRecord[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState('');
  const [salesTiming, setSalesTiming] = React.useState<SalesTimingResult | null>(null);
  const [timingLoading, setTimingLoading] = React.useState(false);
  const [multiCrop, setMultiCrop] = React.useState<MultiCropProfitabilityResult | null>(null);
  const [planLoading, setPlanLoading] = React.useState(false);

  React.useEffect(() => {
    const cropParam = searchParams.get('crop');
    if (cropParam) {
      setSelectedCrop(resolveCropKey(cropParam));
    }
  }, [searchParams]);

  const fetchPrices = React.useCallback(async (cropKey: string, region: string) => {
    setLoading(true);
    setError(null);
    try {
      const cropNames = CROP_KEYWORDS[cropKey] || [cropKey];
      const all: PriceRecord[] = [];

      const res = await pricesApi.getTrends({ cropName: cropNames[0], region, limit: 200 });
      if (res.success && res.data?.length) {
        all.push(...res.data);
      }

      if (all.length === 0) {
        for (const cn of cropNames) {
          const r = await pricesApi.getTrends({ cropName: cn, limit: 200 });
          if (r.success && r.data) all.push(...r.data);
        }
      }

      const seen = new Set<string>();
      const deduped = all.filter((r) => {
        const k = `${r.year}-${r.month}-${r.region}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      deduped.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

      setPriceRecords(deduped);
      if (deduped.length > 0) {
        setLastUpdated(
          new Date().toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        );
      }
    } catch {
      setError(tr.loadError);
    } finally {
      setLoading(false);
    }
  }, [language, tr.loadError]);

  React.useEffect(() => {
    fetchPrices(selectedCrop, selectedRegion);
  }, [selectedCrop, selectedRegion, fetchPrices]);

  React.useEffect(() => {
    const loadSalesTiming = async () => {
      setTimingLoading(true);
      try {
        const cropName = (CROP_KEYWORDS[selectedCrop] || [selectedCrop])[0];
        const res = await pricesApi.getSalesTiming({ cropName, region: selectedRegion });
        setSalesTiming(res.success && res.data ? res.data : null);
      } finally {
        setTimingLoading(false);
      }
    };
    void loadSalesTiming();
  }, [selectedCrop, selectedRegion]);

  React.useEffect(() => {
    const loadMultiCrop = async () => {
      setPlanLoading(true);
      try {
        const res = await pricesApi.getMultiCropProfitability();
        setMultiCrop(res.success && res.data ? res.data : null);
      } finally {
        setPlanLoading(false);
      }
    };
    void loadMultiCrop();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCrop.trim()) return;
    setSelectedCrop(resolveCropKey(searchCrop));
    setSearchCrop('');
  };

  const activeCropLabel = CROP_LABELS[selectedCrop]?.[language] ?? selectedCrop;

  const chartData = React.useMemo(() => {
    if (priceRecords.length === 0) return [];
    const sorted = [...priceRecords].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    return sorted.slice(-24).map((r) => ({
      label: `${MONTH_NAMES[r.month - 1]} ${r.year}`,
      value: Math.round(r.avgPrice),
    }));
  }, [priceRecords]);

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].value : null;
  const prevPrice = chartData.length > 1 ? chartData[chartData.length - 2].value : null;
  const priceChange =
    currentPrice && prevPrice
      ? (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(1)
      : null;
  const priceTrend = priceChange && parseFloat(priceChange) >= 0 ? 'up' : 'down';

  const avgPrice =
    chartData.length > 0
      ? Math.round(chartData.reduce((s, d) => s + d.value, 0) / chartData.length)
      : 0;

  const priceConfig = {
    value: { label: 'Price', color: '#2A5A2A' },
  } satisfies ChartConfig;

  const barConfig = {
    value: { label: 'Price', color: '#479e73' },
  } satisfies ChartConfig;

  const monthlyBarData = React.useMemo(() => {
    return chartData.slice(-6).map((d) => ({
      label: d.label.split(' ')[0],
      value: d.value,
    }));
  }, [chartData]);

  const barTrend =
    monthlyBarData.length >= 2
      ? (
          ((monthlyBarData[monthlyBarData.length - 1].value -
            monthlyBarData[0].value) /
            monthlyBarData[0].value) *
          100
        ).toFixed(1)
      : null;

  const marketData = React.useMemo(() => {
    return priceRecords.slice(-12).map((r) => {
      const samePeriod = priceRecords.find(
        (p) => p.month === r.month && p.year === r.year - 1
      );
      const pct = samePeriod
        ? ((r.avgPrice - samePeriod.avgPrice) / samePeriod.avgPrice) * 100
        : null;
      const trendLabel =
        pct != null ? `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%` : '—';
      return {
        market: `${MONTH_NAMES[r.month - 1]} ${r.year}`,
        demand: '—',
        trend: {
          label: trendLabel,
          up: pct != null && pct >= 0,
          value: pct != null ? String(pct) : '0',
        },
        price: `ETB ${Math.round(r.avgPrice).toLocaleString()}/kg`,
      };
    });
  }, [priceRecords]);

  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-5 pb-6 ${language === 'am' ? 'amharic' : ''}`}>
      <header className="mb-6 border-b border-[#5B8C51]/15 pb-4">
        <h1>{tr.title}</h1>
        <p className="text-muted mt-1 text-sm">{tr.subtitle}</p>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {COMMON_CROPS.map((crop) => {
          const isActive = selectedCrop === crop;
          return (
            <button
              key={crop}
              type="button"
              onClick={() => setSelectedCrop(crop)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#2A5A2A] text-white'
                  : 'text-[#2A5A2A] hover:bg-[#5B8C51]/10'
              }`}
            >
              <Wheat className="h-3.5 w-3.5" />
              {CROP_LABELS[crop][language]}
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex flex-col gap-3 border-b border-[#5B8C51]/15 pb-5 sm:flex-row sm:items-center">
        <label className="flex flex-col gap-1 text-sm sm:w-48">
          <span className="text-xs font-medium text-black/50">{tr.selectRegion}</span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="rounded-lg border border-[#5B8C51]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#5B8C51]/50"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-xs font-medium text-black/50">{tr.searchPlaceholder}</span>
            <input
              type="text"
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              placeholder={tr.searchPlaceholder}
              className="rounded-lg border border-[#5B8C51]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#5B8C51]/50"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-[#2A5A2A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1E431E] sm:mb-0"
          >
            {tr.show}
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#5B8C51]" />
          {tr.loading}
        </div>
      )}

      {error && !loading && (
        <p className="rounded-lg border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && priceRecords.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">{tr.noData}</p>
      )}

      {!loading && !error && chartData.length > 0 && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 border-b border-[#5B8C51]/15 pb-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-black/40">
                {tr.currentPrice}
              </p>
              <p className="mt-1 text-xl font-semibold text-[#2A5A2A]">
                {currentPrice ? `ETB ${currentPrice.toLocaleString()}` : '—'}
                <span className="text-sm font-normal text-gray-400">/kg</span>
              </p>
              {priceChange && (
                <p
                  className={`mt-0.5 text-xs font-medium ${
                    priceTrend === 'up' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {priceTrend === 'up' ? '↑' : '↓'} {Math.abs(parseFloat(priceChange))}%{' '}
                  {tr.monthChange}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-black/40">
                {tr.twelveMonthAvg}
              </p>
              <p className="mt-1 text-xl font-semibold text-[#2A5A2A]">
                {avgPrice ? `ETB ${avgPrice.toLocaleString()}` : '—'}
                <span className="text-sm font-normal text-gray-400">/kg</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {priceRecords.length} {tr.records}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wide text-black/40">
                {tr.selectRegion}
              </p>
              <p className="mt-1 text-lg font-medium text-gray-800">{selectedRegion}</p>
              <p className="text-sm capitalize text-gray-500">{activeCropLabel}</p>
            </div>
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <section className="border-b border-[#5B8C51]/15 pb-5 lg:border-b-0 lg:border-r lg:pr-6 lg:pb-0">
              <div className="mb-3 flex items-center gap-2 text-[#2A5A2A]">
                <Clock className="h-4 w-4" />
                <h2 className="text-sm font-semibold">{tr.sellTimingTitle}</h2>
              </div>
              {timingLoading ? (
                <p className="text-sm text-gray-500">{tr.analyzing}</p>
              ) : salesTiming?.hasData && salesTiming.recommendation ? (
                <dl className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between gap-4">
                    <dt className="text-black/50">{tr.bestMonth}</dt>
                    <dd className="font-medium">{salesTiming.recommendation.bestSellMonthName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-black/50">{tr.latestPrice}</dt>
                    <dd className="font-medium">
                      ETB {Math.round(salesTiming.recommendation.latestKnownPrice).toLocaleString()}
                      /kg
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-black/50">{tr.expectedGain}</dt>
                    <dd
                      className={`font-medium ${
                        salesTiming.recommendation.expectedGainPercent >= 0
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {salesTiming.recommendation.expectedGainPercent >= 0 ? '+' : ''}
                      {salesTiming.recommendation.expectedGainPercent.toFixed(1)}%
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-gray-500">{tr.noTiming}</p>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2 text-[#2A5A2A]">
                <PieChart className="h-4 w-4" />
                <h2 className="text-sm font-semibold">{tr.multiCropTitle}</h2>
              </div>
              {planLoading ? (
                <p className="text-sm text-gray-500">{tr.loadingPlan}</p>
              ) : multiCrop?.summary ? (
                <dl className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between gap-4">
                    <dt className="text-black/50">{tr.topCrop}</dt>
                    <dd className="font-medium text-right">
                      {multiCrop.summary.topRecommendation || '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-black/50">{tr.profitableNow}</dt>
                    <dd className="font-medium">
                      {multiCrop.summary.profitableNow}/{multiCrop.summary.cropsAnalyzed}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-black/50">{tr.diversified}</dt>
                    <dd className="font-medium">{multiCrop.summary.diversificationIndex}%</dd>
                  </div>
                  {multiCrop.topRecommendations?.[0]?.trendPercent != null && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-black/50">{tr.gainVsRecent}</dt>
                      <dd
                        className={`font-medium ${
                          multiCrop.topRecommendations[0].trendPercent >= 0
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {multiCrop.topRecommendations[0].trendPercent >= 0 ? '+' : ''}
                        {multiCrop.topRecommendations[0].trendPercent.toFixed(1)}%
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-sm text-gray-500">{tr.noPlanData}</p>
              )}
            </section>
          </div>

          <div className="mb-8 grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="min-w-0">
              <LineGraph
                data={chartData}
                title={`${activeCropLabel} — ${tr.priceHistory}`}
                badge={
                  priceChange
                    ? `${priceTrend === 'up' ? '↑' : '↓'} ${Math.abs(parseFloat(priceChange))}%`
                    : ''
                }
                badgeIcon={
                  priceTrend === 'up' ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )
                }
                minNotice={`${tr.twelveMonthAvg}: ${avgPrice}`}
                maxNotice={selectedRegion}
                config={priceConfig}
              />
            </div>
            <div className="min-w-0">
              <BarGraph
                data={monthlyBarData}
                title={`${activeCropLabel} — ${tr.monthlyPrices}`}
                badge={
                  barTrend
                    ? `${parseFloat(barTrend) >= 0 ? '+' : ''}${barTrend}%`
                    : ''
                }
                badgeIcon={
                  barTrend && parseFloat(barTrend) >= 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )
                }
                leftNote={tr.historicalData}
                rightNote={selectedRegion}
                config={barConfig}
              />
            </div>
          </div>

          {marketData.length > 0 && (
            <section className="min-w-0">
              <DataTable
                compact
                title={tr.priceTableTitle}
                data={marketData}
                columnLabels={{
                  period: tr.tablePeriod,
                  trend: tr.tableTrend,
                  price: tr.tablePrice,
                }}
                footnotes={
                  <>
                    <span className="flex items-center gap-1">
                      <Tractor className="h-3 w-3" />
                      {tr.historicalData}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {tr.cropPrices}
                    </span>
                  </>
                }
              />
            </section>
          )}
        </>
      )}

      <footer className="mt-8 flex flex-col gap-1 border-t border-dashed border-[#5B8C51]/20 pt-4 text-xs text-gray-400 sm:flex-row sm:justify-between">
        <span>
          {tr.priceData}
          {lastUpdated ? ` · ${lastUpdated}` : ''}
        </span>
        <span>{tr.sources}</span>
      </footer>
    </div>
  );
}

export default function TrendsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#5B8C51]" />
        </div>
      }
    >
      <TrendsPageContent />
    </React.Suspense>
  );
}
