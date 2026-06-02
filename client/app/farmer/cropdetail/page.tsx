'use client';
import React, { useState } from 'react';
import { MapPin, Loader2, Sprout, FlaskConical, Thermometer, Droplets } from 'lucide-react';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { useFarms } from '@/components/hooks/useFarms';
import { api } from '@/lib/api';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';
import type { DashboardTranslations } from '@/lib/dashboard.translations';

interface Recommendation {
  crop: string;
  confidence: string;
}

interface CropRecommendationResponse {
  recommendations: Recommendation[];
}

function getSuitabilityLabel(
  confidence: number,
  s: DashboardTranslations['cropDetail']['suitability']
): { label: string; color: string; bar: string } {
  if (confidence >= 0.7) return { label: s.highly, color: 'text-green-700', bar: 'bg-green-500' };
  if (confidence >= 0.4) return { label: s.moderate, color: 'text-amber-700', bar: 'bg-amber-500' };
  if (confidence >= 0.1) return { label: s.low, color: 'text-orange-700', bar: 'bg-orange-500' };
  return { label: s.notRecommended, color: 'text-red-700', bar: 'bg-red-500' };
}

const CropDetail = () => {
  const t = useTranslations();
  const c = t.dashboard.cropDetail;
  const { language } = useLanguage();
  const { data, isLoading: farmsLoading } = useFarms();
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const farms = data?.farms || [];
  const selectedFarm = farms.find((f) => f.id === selectedFarmId);

  const getRecommendation = async () => {
    if (!selectedFarm) return;
    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const response = await api.post('/agriai/recommend/crop', {
        nitrogen: selectedFarm.nitrogen ?? 0,
        phosphorus: selectedFarm.phosphorus ?? 0,
        potassium: selectedFarm.potassium ?? 0,
        temperature: selectedFarm.temperature ?? 25,
        humidity: selectedFarm.humidity ?? 60,
        ph: selectedFarm.ph ?? 6.5,
        rainfall: selectedFarm.rainfall ?? 100,
        soil_color: selectedFarm.soilColor || 'brown',
      });

      if (response.success && response.data) {
        const data = response.data as CropRecommendationResponse;
        setRecommendations(data.recommendations || []);
      } else {
        setError(response.message || c.failedRecommendation);
      }
    } catch {
      setError(c.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-gray-50 ${language === 'am' ? 'amharic' : ''}`}>
      <Header />

      <div className="flex justify-center items-start flex-1 p-4">
        <div className="w-full max-w-lg space-y-6">

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#2A5A2A]/10 rounded-lg">
                <Sprout className="w-5 h-5 text-[#2A5A2A]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2A5A2A]">{c.title}</h2>
                <p className="text-xs text-black/40">{c.subtitle}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-black/70">{c.selectFarm}</label>
                {farmsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-black/40 h-9">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {c.loadingFarms}
                  </div>
                ) : (
                  <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={c.chooseFarmPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map((farm) => (
                        <SelectItem key={farm.id} value={farm.id}>
                          {farm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {farms.length === 0 && !farmsLoading && (
                  <p className="text-xs text-amber-600">
                    {c.noFarms}{' '}
                    <a href="/farmer/farms" className="underline font-medium">{c.myFarmsLink}</a>
                  </p>
                )}
              </div>

              {selectedFarm && (
                <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-black/60">
                    <FlaskConical className="w-3.5 h-3.5 text-[#2A5A2A]" />
                    {selectedFarm.soilType
                      ? <span>{selectedFarm.soilType} {c.soilSuffix}</span>
                      : c.soilNotSet}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-black/60">
                    <MapPin className="w-3.5 h-3.5 text-[#2A5A2A]" />
                    {[selectedFarm.region, selectedFarm.woreda].filter(Boolean).join(', ') || c.locationNotSet}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-black/60">
                    <Thermometer className="w-3.5 h-3.5 text-[#2A5A2A]" />
                    {selectedFarm.temperature != null ? `${selectedFarm.temperature}°C` : '—'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-black/60">
                    <Droplets className="w-3.5 h-3.5 text-[#2A5A2A]" />
                    {selectedFarm.humidity != null ? `${selectedFarm.humidity}%` : '—'}
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-[#2A5A2A] hover:bg-[#1e441e] text-white py-5 text-base"
                disabled={!selectedFarm || loading || farmsLoading}
                onClick={getRecommendation}
              >
                {loading ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" /> {c.analyzing}</>
                ) : (
                  c.getRecommendation
                )}
              </Button>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 text-center">{error}</div>
              )}
            </div>
          </div>

          {recommendations && recommendations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#2A5A2A]" />
                <h3 className="text-lg font-bold text-[#2A5A2A]">{c.topCrops}</h3>
              </div>

              {recommendations.map((rec, i) => {
                const conf = parseFloat(rec.confidence);
                const pct = Math.round(conf * 100);
                const suitability = getSuitabilityLabel(conf, c.suitability);
                const rank = i + 1;

                return (
                  <Card key={i} className={`border-l-4 ${rank === 1 ? 'border-l-[#2A5A2A]' : 'border-l-black/10'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 mt-0.5 flex items-center justify-center rounded-full bg-[#2A5A2A]/10 text-[#2A5A2A] font-bold text-sm flex-shrink-0">{rank}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-black/80 capitalize text-base">{rec.crop}</span>
                              {rank === 1 && (
                                <span className="text-[10px] bg-[#2A5A2A]/10 text-[#2A5A2A] font-semibold px-1.5 py-0.5 rounded">
                                  {c.bestMatch}
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-black/50">{pct}%</span>
                          </div>

                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${suitability.bar}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium ${suitability.color}`}>
                              {suitability.label}
                            </span>
                            <span className="text-xs text-black/30">
                              {c.basedOnData}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 leading-relaxed">
                {c.disclaimer}
              </div>
            </div>
          )}

          {recommendations && recommendations.length === 0 && !error && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Sprout className="w-10 h-10 mx-auto mb-3 text-black/20" />
              <p className="text-sm text-black/50">{c.noCropsFound}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropDetail;
