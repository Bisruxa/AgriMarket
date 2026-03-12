import { useTranslations } from '@/components/hooks/useTranlations';
import { stats } from '../../lib/stats';

const StatusCard = () => {
    const t = useTranslations();
    
    return (
        <div>
            {/* card to show status */}
            <div className="grid md:grid-cols-3 gap-4 grid-cols-1 p-4">
                {stats.map((stat, index) => (
                    <div 
                        key={index} 
                        className={`${stat.color} ${stat.borderColor} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
                    >
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm font-medium text-gray-600 mb-1'>
                                    {stat.title === 'Farmers' && t.statusCard.stats.farmers}
                                    {stat.title === 'Traders' && t.statusCard.stats.traders}
                                    {stat.title === 'Total Users' && t.statusCard.stats.totalUsers}
                                </p>
                                <p className={`text-2xl font-bold ${stat.textColor}`}>
                                    {stat.value.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatusCard;