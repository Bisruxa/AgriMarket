'use client';
import React, { useState } from 'react';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { agriaiApi, ApiResponse } from '@/lib/api';
import { Loader2, TrendingUp, TrendingDown, Minus, DollarSign, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';

interface PriceForecast {
  crop_name: string;
  region: string;
  year: number;
  month: number;
  predicted_price: number;
  confidence_interval: [number, number];
  trend: string;
  trend_percentage: number;
}

interface Metadata {
  crops: string[];
  regions: string[];
}

const TrendBadge = ({
  trend,
  percentage,
  labels,
}: {
  trend: string;
  percentage: number;
  labels: { increasing: string; decreasing: string; stable: string };
}) => {
  if (trend === 'increasing') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
        <TrendingUp className="h-4 w-4" /> {labels.increasing} +{percentage}%
      </span>
    );
  }
  if (trend === 'decreasing') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
        <TrendingDown className="h-4 w-4" /> {labels.decreasing} {percentage}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
      <Minus className="h-4 w-4" /> {labels.stable}
    </span>
  );
};

const PriceForecastPage = () => {
  const t = useTranslations();
  const pf = t.dashboard.priceForecast;
  const { language } = useLanguage();
  const months = pf.months.map((label, i) => ({ value: i + 1, label }));

  const [crop, setCrop] = useState('');
  const [region, setRegion] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [result, setResult] = useState<PriceForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: meta, isLoading: metaLoading } = useQuery<ApiResponse<Metadata>>({
    queryKey: ['price-forecaster-metadata'],
    queryFn: () => agriaiApi.getPriceForecasterMetadata(),
  });

  const handleSubmit = async () => {
    if (!crop || !region) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await agriaiApi.predictPrice({ crop_name: crop, region, year, month });
      if (res.success && res.data) {
        setResult(res.data as unknown as PriceForecast);
      } else {
        setError(res.message || pf.loadError);
      }
    } catch {
      setError(t.dashboard.cropDetail.networkError);
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  return (
    <div className={`flex flex-col min-h-screen bg-gray-50 ${language === 'am' ? 'amharic' : ''}`}>
      <Header />

      <div className="flex justify-center items-start flex-1 p-4">
        <div className="w-full max-w-xl space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#2A5A2A] mb-1">{pf.title}</h2>
            <p className="text-sm text-black/50 mb-6">
              {pf.subtitle}
            </p>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-black/70">{pf.selectCrop}</label>
                  <Select value={crop} onValueChange={setCrop} disabled={metaLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={metaLoading ? pf.loadingOptions : pf.selectCropPlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {metaLoading ? null : meta?.data?.crops?.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-black/70">{pf.selectRegion}</label>
                  <Select value={region} onValueChange={setRegion} disabled={metaLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={metaLoading ? pf.loadingOptions : pf.selectRegionPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {metaLoading ? null : meta?.data?.regions?.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-black/70">{pf.year}</label>
                  <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-black/70">{pf.month}</label>
                  <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="w-full bg-[#2A5A2A] hover:bg-[#1e441e] text-white py-5 text-base"
                disabled={!crop || !region || loading}
                onClick={handleSubmit}
              >
                {loading ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> {pf.predicting}</> : pf.predict}
              </Button>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {result && (
            <div className="space-y-4">
              <Card className="border border-[#2A5A2A]/20 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#2A5A2A]">{result.crop_name}</h3>
                      <p className="text-sm text-black/50">{result.region} — {months[result.month - 1].label} {result.year}</p>
                    </div>
                    <TrendBadge
                      trend={result.trend}
                      percentage={result.trend_percentage}
                      labels={{
                        increasing: pf.trendIncreasing,
                        decreasing: pf.trendDecreasing,
                        stable: pf.trendStable,
                      }}
                    />
                  </div>

                  <div className="bg-gradient-to-br from-[#2A5A2A]/5 to-[#2A5A2A]/10 rounded-xl p-5 mb-4">
                    <div className="flex items-center gap-2 text-sm text-black/50 mb-1">
                      <DollarSign className="h-4 w-4" />
                      {pf.predictedPriceLabel}
                    </div>
                    <div className="text-4xl font-extrabold text-[#2A5A2A]">
                      {result.predicted_price.toFixed(2)}
                      <span className="text-lg font-normal text-black/40 ml-1">ETB</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-black/5 rounded-lg p-3">
                      <p className="text-xs text-black/40 mb-0.5">{pf.priceRange}</p>
                      <p className="text-sm font-semibold text-black/70">
                        {result.confidence_interval[0].toFixed(2)} – {result.confidence_interval[1].toFixed(2)} ETB
                      </p>
                    </div>
                    <div className="bg-white border border-black/5 rounded-lg p-3">
                      <p className="text-xs text-black/40 mb-0.5">{pf.expectedChange}</p>
                      <p className="text-sm font-semibold text-black/70">
                        {result.trend === 'increasing' ? '+' : ''}{result.trend_percentage.toFixed(1)}%
                        <span className="text-xs text-black/40 ml-1 font-normal capitalize">({result.trend})</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      {pf.disclaimer}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceForecastPage;
