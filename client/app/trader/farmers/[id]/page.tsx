'use client';

import React from 'react';
import Header from '@/components/common/Header';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api';
import { ArrowLeft, MapPin, Phone, ShieldCheck, Sprout, Package, Loader2 } from 'lucide-react';

export default function TraderFarmerProfilePage() {
  const params = useParams<{ id: string }>();
  const farmerId = params?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['trader-farmer-profile', farmerId],
    queryFn: async () => {
      const response = await userApi.getFarmerProfile(String(farmerId));
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to load farmer profile');
      }
      return response.data;
    },
    enabled: Boolean(farmerId),
  });

  return (
    <>
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link
          href="/trader/purchases"
          className="mb-4 inline-flex items-center gap-2 text-sm text-[#2A5A2A] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>

        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-[#bfdfce] bg-white p-4 text-sm text-[#2A5A2A]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading farmer profile...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {(error as Error).message}
          </div>
        )}

        {!isLoading && !error && data && (
          <div className="space-y-5">
            <section className="rounded-xl border border-[#bfdfce] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#1f543c]">{data.farmer.name}</h1>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-[#57886c]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {[data.farmer.woreda, data.farmer.region].filter(Boolean).join(', ') || 'Location not set'}
                    </span>
                    {data.farmer.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {data.farmer.phone}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4" />
                      {data.farmer.isVerified ? 'Verified farmer' : 'Unverified'}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-[#f3faf6] px-3 py-2 text-xs text-[#2A5A2A]">
                  Joined {new Date(data.farmer.joinedAt).toLocaleDateString()}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-[#bfdfce] bg-white p-3">
                <p className="text-xs text-black/40">Farms</p>
                <p className="text-lg font-semibold text-[#1f543c]">{data.stats.farmCount}</p>
              </div>
              <div className="rounded-lg border border-[#bfdfce] bg-white p-3">
                <p className="text-xs text-black/40">Active products</p>
                <p className="text-lg font-semibold text-[#1f543c]">{data.stats.activeProductCount}</p>
              </div>
              <div className="rounded-lg border border-[#bfdfce] bg-white p-3">
                <p className="text-xs text-black/40">Avg listing price</p>
                <p className="text-lg font-semibold text-[#1f543c]">
                  {data.stats.averageListingPrice != null ? `ETB ${data.stats.averageListingPrice.toLocaleString()}` : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-[#bfdfce] bg-white p-3">
                <p className="text-xs text-black/40">Available stock</p>
                <p className="text-lg font-semibold text-[#1f543c]">{data.stats.totalAvailableStock.toLocaleString()}</p>
              </div>
            </section>

            <section className="rounded-xl border border-[#bfdfce] bg-white p-5">
              <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-[#1f543c]">
                <Sprout className="h-5 w-5" />
                Farm lands
              </h2>
              <div className="space-y-3">
                {data.farms.length === 0 && <p className="text-sm text-[#57886c]">No active farms.</p>}
                {data.farms.map((farm) => (
                  <div key={farm.id} className="rounded-lg border border-[#e2efe8] p-3">
                    <p className="font-medium text-[#1f543c]">{farm.name}</p>
                    <p className="text-xs text-[#57886c]">
                      {[farm.woreda, farm.region].filter(Boolean).join(', ') || 'Location not set'}
                    </p>
                    <p className="mt-1 text-xs text-black/60">
                      {farm.size && farm.sizeUnit ? `${farm.size} ${farm.sizeUnit}` : 'Size not set'}
                      {farm.soilType ? ` • Soil: ${farm.soilType}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#bfdfce] bg-white p-5">
              <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-[#1f543c]">
                <Package className="h-5 w-5" />
                Active listings
              </h2>
              <div className="space-y-2">
                {data.activeProducts.length === 0 && (
                  <p className="text-sm text-[#57886c]">No active products right now.</p>
                )}
                {data.activeProducts.map((product) => (
                  <div key={product.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e2efe8] p-3">
                    <div>
                      <p className="font-medium text-[#1f543c]">{product.name}</p>
                      <p className="text-xs text-[#57886c]">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#1f543c]">ETB {Number(product.price).toLocaleString()} / {product.unit}</p>
                      <p className="text-xs text-[#57886c]">Stock: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
