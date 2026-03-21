'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import RejectionModal from '@/components/popups/rejectionModel';
import OwnerInfoCard from '@/components/cards/trader/ownerInfo';
import AdditionalInfoCard from '@/components/cards/trader/AdditionalInfo';
import { useTranslations } from '@/components/hooks/useTranlations';
// import { useTraderDetail, useApproveTrader, useRejectTrader } from '@/components/hooks/admin/useAdminQueries';
import { useTraderDetail,useApproveTrader,useRejectTrader } from '@/components/hooks/userAdminQueries';
import * as React from 'react';

export default function TraderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const t = useTranslations();
  const { id } = React.use(params);
  
  // Use the custom hooks
  const { data: trader, isLoading, error } = useTraderDetail(id);
  const approveMutation = useApproveTrader();
  const rejectMutation = useRejectTrader();

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(id);
      router.push('/admin/traderApproval?success=approved');
    } catch (err) {
      console.error('Error approving trader:', err);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectMutation.mutateAsync({ id, reason });
      setShowRejectionModal(false);
      router.push('/admin/traderApproval?success=rejected');
    } catch (err) {
      console.error('Error rejecting trader:', err);
    }
  };

  // Determine if any action is in progress
  const actionInProgress = approveMutation.isPending || rejectMutation.isPending;

  if (isLoading) {
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

  if (error || !trader) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {error?.message || (t.traderDetail?.notFound || 'Trader not found')}
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
                {t.traderDetail?.reviewApplication || 'Review trader application'} 
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
                className="px-4 py-2 bg-[#5B8C51] text-white rounded-lg hover:bg-[#668B57] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {approveMutation.isPending 
                  ? (t.traderDetail?.approving || 'Approving...') 
                  : (t.traderDetail?.approveApplication || 'Approve Application')}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OwnerInfoCard trader={trader } />
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
        isProcessing={rejectMutation.isPending}
      />
    </div>
  );
}