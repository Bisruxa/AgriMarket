'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { FarmFormFields, FarmFormData, emptyFarmForm } from '@/components/Farmer/FarmFormFields';
import { farmsApi } from '@/lib/api';

export default function AddFarmPage() {
  const router = useRouter();
  const [form, setForm] = useState<FarmFormData>(emptyFarmForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Farm name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        soilType: form.soilType || undefined,
        soilColor: form.soilColor || undefined,
        region: form.region || undefined,
        woreda: form.woreda || undefined,
        kebele: form.kebele || undefined,
      };
      const res = await farmsApi.create(payload);
      if (res.success) {
        router.push('/farmer/farms');
      } else {
        setError(res.message || 'Failed to add farm');
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
        <div className="w-full max-w-xl space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/farmer/farms" className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <h2 className="text-2xl font-bold text-[#2A5A2A]">Add Farm</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-black/10 p-6">
            <div className="space-y-1 mb-4">
              <p className="text-sm text-black/50">
                Register your farm land so AgriAI can provide personalized crop recommendations.
              </p>
            </div>

            <div className="space-y-4">
              <FarmFormFields form={form} onChange={setForm} />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/farmer/farms')}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !form.name.trim()}
                  className="flex-1 bg-[#2A5A2A] hover:bg-[#1e441e] text-white"
                >
                  {loading ? 'Saving...' : 'Save Farm'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}