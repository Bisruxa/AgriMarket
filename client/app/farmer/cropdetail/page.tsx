'use client';
import React, { useState } from 'react';
import { MapPin, Leaf, Loader2, Sprout, TrendingUp } from 'lucide-react';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { useFarms } from '@/components/hooks/useFarms';
import { api } from '@/lib/api';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface Recommendation {
  crop: string;
  confidence: string;
}

interface CropRecommendationResponse {
  recommendations: Recommendation[];
}

const CropDetail = () => {
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
        setError(response.message || 'Failed to get recommendation');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="flex justify-center items-start flex-1 p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#2A5A2A] mb-6 text-center">
              Get Crop Recommendation
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 text-[#2A5A2A]" />
                  Select Your Farm
                </label>
                {farmsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-black/50">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading your farms...
                  </div>
                ) : (
                  <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a farm" />
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
                    No farms registered. Go to Dashboard to add your farm first.
                  </p>
                )}
              </div>

              {selectedFarm && (
                <div className="bg-green-50 rounded-lg p-3 space-y-1 text-sm text-black/70">
                  <p><span className="font-medium">Soil:</span> {selectedFarm.soilType || 'Not set'}</p>
                  <p><span className="font-medium">Location:</span> {[selectedFarm.region, selectedFarm.woreda].filter(Boolean).join(', ') || 'Not set'}</p>
                </div>
              )}

              <Button
                className="w-full bg-[#2A5A2A] hover:bg-[#1e441e] text-white py-6 text-lg"
                disabled={!selectedFarm || loading || farmsLoading}
                onClick={getRecommendation}
              >
                {loading ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Analyzing...</>
                ) : (
                  'Get Recommendation'
                )}
              </Button>

              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
            </div>
          </div>

          {recommendations && recommendations.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-5 h-5 text-[#2A5A2A]" />
                <h3 className="text-lg font-bold text-[#2A5A2A]">Recommended Crops</h3>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <Card key={i} className="border border-[#2A5A2A]/20">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{['', '🥇', '🥈', '🥉'][i] || ''}</span>
                        <span className="font-semibold text-black/80 capitalize">{rec.crop}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[#2A5A2A] font-medium">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {Math.round(parseFloat(rec.confidence) * 100)}%
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {recommendations && recommendations.length === 0 && !error && (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center text-black/50">
              No recommendations returned. Try adjusting farm details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropDetail;
