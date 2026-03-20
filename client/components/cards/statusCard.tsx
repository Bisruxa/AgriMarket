// components/cards/statusCard.tsx
import { useTranslations } from '@/components/hooks/useTranlations';
import { StatsData } from '@/types/statsData';

interface StatusCardProps {
  stats?: StatsData | { success: boolean; data: StatsData } | null;
  isLoading?: boolean; 
}

const StatusCard = ({ stats, isLoading }: StatusCardProps) => {
  const t = useTranslations();
  
  // Extract the actual data if it's wrapped
  const actualStats = stats && 'data' in stats ? stats.data : stats;
  
  const statConfigs = [
    {
      title: 'Farmers',
      titleAm: 'ገበሬዎች',
      color: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    },
    {
      title: 'Traders',
      titleAm: 'ነጋዴዎች',
      color: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Total Users',
      titleAm: 'አጠቃላይ ተጠቃሚዎች',
      color: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    }
  ];
  
  const getValue = (index: number) => {
    if (!actualStats) return 0;
    
    switch(index) {
      case 0: return actualStats.users?.farmers ?? 0;
      case 1: return actualStats.users?.traders ?? 0;
      case 2: return actualStats.users?.total ?? 0;
      default: return 0;
    }
  };

  const NumberSkeleton = () => (
    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
  );

  return (
    <div className="grid md:grid-cols-3 gap-4 grid-cols-1 p-4">
      {statConfigs.map((stat, index) => (
        <div 
          key={index} 
          className={`${stat.color} ${stat.borderColor} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 mb-1'>
                {t?.statusCard?.stats?.farmers && index === 0 
                  ? t.statusCard.stats.farmers 
                  : t?.statusCard?.stats?.traders && index === 1
                  ? t.statusCard.stats.traders
                  : t?.statusCard?.stats?.totalUsers && index === 2
                  ? t.statusCard.stats.totalUsers
                  : stat.title}
              </p>
              
              {isLoading ? (
                <NumberSkeleton />
              ) : (
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {getValue(index).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusCard;