// app/admin/traderApproval/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import { MOCK_TRADER } from '@/lib/mockUser';
import RejectionModal from '@/components/popups/rejectionModel';
import OwnerInfoCard from '@/components/cards/trader/ownerInfo';
import AdditionalInfoCard from '@/components/cards/trader/AdditionalInfo';
import { Trader } from '@/types/auth-page';
import { useTranslations } from '@/components/hooks/useTranlations';

const fetchTraderDetails = async (id: string) => { 
  return MOCK_TRADER;
};

export default function TraderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [trader, setTrader] = useState<Trader | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    const loadTrader = async () => {
      try {
        const data = await fetchTraderDetails(params.id);
        setTrader(data as Trader);
      } catch (error) {
        console.error('Error fetching trader:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTrader();
  }, [params.id]);

  const handleApprove = async () => {
    setActionInProgress(true);
    try {
      console.log('Approving trader:', params.id);
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/admin/traderApproval?success=approved');
    } catch (error) {
      console.error('Error approving trader:', error);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async (reason: string) => {
    setActionInProgress(true);
    try {
      console.log('Rejecting trader:', params.id, 'Reason:', reason);
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/admin/traderApproval?success=rejected');
    } catch (error) {
      console.error('Error rejecting trader:', error);
    } finally {
      setActionInProgress(false);
      setShowRejectionModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!trader) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {t.traderDetail?.notFound || 'Trader not found'}
            </h2>
            <Link href="/admin/traderApproval" className="text-[#5B8C51] hover:text-[#4a7342] mt-2 inline-block">
              {t.traderDetail?.backToApprovals || 'Back to Approvals'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <hr />
      <div className="max-w-7xl mx-auto py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            href="/admin/traderApproval" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.traderDetail?.backToApprovals || 'Back to Approvals'}
          </Link>
        </div>

        {/* Header with Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{trader.businessName}</h1>
              <p className="text-gray-600 mt-1">
                {t.traderDetail?.reviewApplication || 'Review trader application'} #{trader.id}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectionModal(true)}
                disabled={actionInProgress}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {t.traderDetail?.reject || 'Reject'}
              </button>
              <button
                onClick={handleApprove}
                disabled={actionInProgress}
                className="px-4 py-2 bg-[#5B8C51] text-white rounded-lg hover:bg-[#4a7342] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {t.traderDetail?.approveApplication || 'Approve Application'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OwnerInfoCard trader={trader} />
          </div>
          <div>
            <AdditionalInfoCard trader={trader} />
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onConfirm={handleReject}
        isProcessing={actionInProgress}
      />
    </div>
  );
}