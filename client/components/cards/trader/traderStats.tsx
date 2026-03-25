'use client';
import { useTranslations } from '@/components/hooks/useTranlations';
import { StatsData } from '@/types/statsData';

interface TraderStatsProps {
  stats: StatsData | null;
  loading?: boolean;
  error?: string | null;
}

const TraderStats = ({ stats, loading, error }: TraderStatsProps) => {
  const t = useTranslations();

  if (loading) return <p>Loading stats...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-600">{t.traderStats?.totalRequests || "Total Requests"}</p>
        <p className="text-2xl font-bold text-gray-900">{stats.users.traders}</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-600">{t.traderStats?.pending || "Pending"}</p>
        <p className="text-2xl font-bold text-yellow-600">{stats.traders.pending}</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-600">{t.traderStats?.approved || "Approved"}</p>
        <p className="text-2xl font-bold text-green-600">{stats.traders.approved}</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-600">{t.traderStats?.rejected || "Rejected"}</p>
        <p className="text-2xl font-bold text-red-600">{stats.traders.rejected}</p>
      </div>
    </div>
  );
};

export default TraderStats;
