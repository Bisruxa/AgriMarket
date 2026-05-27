'use client';
import { useTranslations } from '@/components/hooks/useTranlations';
import { StatsData } from '@/types/statsData';

interface TraderStatsProps {
  stats: StatsData | { success: boolean; data: StatsData } | undefined | null;
  loading?: boolean;
  error?: string | null;
}

const TraderStats = ({ stats, loading, error }: TraderStatsProps) => {
  const t = useTranslations();

  // Add proper loading state with skeleton UI
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  // Normalize stats to always be StatsData
  const normalizedStats: StatsData = 'data' in stats ? stats.data : stats;

  // Access the correct properties from normalized stats
  const totalRequests = normalizedStats.users?.traders || 0;
  const pending = normalizedStats.traders?.pending || 0;
  const approved = normalizedStats.traders?.approved || 0;
  const rejected = normalizedStats.traders?.rejected || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-600">{t.traderStats?.totalRequests || "Total Requests"}</p>
        <p className="text-2xl font-bold text-gray-900">{totalRequests.toLocaleString()}</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-600">{t.traderStats?.pending || "Pending"}</p>
        <p className="text-2xl font-bold text-yellow-600">{pending.toLocaleString()}</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-600">{t.traderStats?.approved || "Approved"}</p>
        <p className="text-2xl font-bold text-green-600">{approved.toLocaleString()}</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-600">{t.traderStats?.rejected || "Rejected"}</p>
        <p className="text-2xl font-bold text-red-600">{rejected.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default TraderStats;