'use client';
import { Building2, User, MapPin, Mail, Phone } from 'lucide-react';
import { Trader } from '@/types/auth-page';
import { useTranslations } from '@/components/hooks/useTranlations';

interface BusinessInfoCardProps {
  trader: Trader;
}

export default function BusinessInfoCard({ trader }: BusinessInfoCardProps) {
  const t = useTranslations();

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Business Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-500" />
          {t.businessInfo?.businessInfo || "Business Information"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t.businessInfo?.registrationNumber || "Registration Number"}</p>
            <p className="font-medium text-gray-900">{trader.businessRegNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t.businessInfo?.taxId || "Tax ID"}</p>
            <p className="font-medium text-gray-900">{trader.taxId}</p>
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-500" />
          {t.businessInfo?.ownerInfo || "Owner Information"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t.businessInfo?.fullName || "Full Name"}</p>
            <p className="font-medium text-gray-900">{trader.ownerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t.businessInfo?.email || "Email"}</p>
            <p className="font-medium text-gray-900 flex items-center gap-2">
              {trader.email}
              <a href={`mailto:${trader.email}`} className="text-[#5B8C51] hover:text-[#4a7342]">
                <Mail className="w-4 h-4" />
              </a>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t.businessInfo?.phone || "Phone"}</p>
            <p className="font-medium text-gray-900 flex items-center gap-2">
              {trader.phone}
              <a href={`tel:${trader.phone}`} className="text-[#5B8C51] hover:text-[#4a7342]">
                <Phone className="w-4 h-4" />
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          {t.businessInfo?.address || "Address"}
        </h2>
        <p className="text-gray-700">{trader.region},{trader.woreda}</p>
      </div>
    </div>
  );
}