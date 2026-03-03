'use client';
import { useState } from "react";
import { MOCK_PENDING_TRADERS } from "@/lib/mockUser";
import { useTranslations } from '@/components/hooks/useTranlations';

const TraderStats = () => {
    const [traders] = useState(MOCK_PENDING_TRADERS);
    const t = useTranslations();

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600">{t.traderStats?.totalRequests || "Total Requests"}</p>
                    <p className="text-2xl font-bold text-gray-900">{traders.length}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600">{t.traderStats?.pending || "Pending"}</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {traders.filter(t => t.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600">{t.traderStats?.approved || "Approved"}</p>
                    <p className="text-2xl font-bold text-green-600">
                        {traders.filter(t => t.status === 'approved').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600">{t.traderStats?.rejected || "Rejected"}</p>
                    <p className="text-2xl font-bold text-red-600">
                        {traders.filter(t => t.status === 'rejected').length}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TraderStats;