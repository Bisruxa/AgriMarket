'use client';
import { Trader } from "@/types/auth-page";
import { useTranslations } from '@/components/hooks/useTranlations';

interface AdditionalInfoCardProps {
  trader: Trader;
}

export default function AdditionalInfoCard({ trader }: AdditionalInfoCardProps) {
  const t = useTranslations();

  const getStatusColor = (status: Trader['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Trader['status']) => {
    switch (status) {
      case 'pending':
        return t.additionalInfo?.pending || "Pending";
      case 'approved':
        return t.additionalInfo?.approved || "Approved";
      case 'rejected':
        return t.additionalInfo?.rejected || "Rejected";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t.additionalInfo?.applicationStatus || "Application Status"}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{t.additionalInfo?.currentStatus || "Current Status"}</span>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(trader.status)}`}>
              {getStatusText(trader.status)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{t.additionalInfo?.registrationDate || "Registration Date"}</span>
            <span className="font-medium">
              {new Date(trader.registrationDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}