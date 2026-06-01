'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import RejectionModal from '@/components/popups/rejectionModel';
import BusinessInfoCard from '@/components/cards/trader/ownerInfo';
import AdditionalInfoCard from '@/components/cards/trader/AdditionalInfo';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useTraderDetail, useApproveTrader, useRejectTrader } from '@/components/hooks/userAdminQueries';
import { Trader } from '@/types/auth-page';

function toDisplayTrader(trader: Trader): Trader {
  return {
    ...trader,
    status: (trader.status || 'pending').toLowerCase() as Trader['status'],
    businessRegNumber: trader.businessRegNumber ?? 'Not provided',
    taxId: trader.taxId ?? 'Not provided',
    businessType: trader.businessType || '—',
  };
}

export default function TraderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const t = useTranslations();
  const { id } = use(params);

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

  const actionInProgress = approveMutation.isPending || rejectMutation.isPending;

  if (isLoading) {
    return (
      <div className="w-full min-w-0 max-w-full py-4">
        <Header />
        <hr className="border-[#E2E8E2]" />
        <div className="py-6 space-y-4 animate-pulse">
          <div className="h-4 bg-[#E2E8E2] rounded w-40" />
          <div className="h-32 bg-white rounded-xl border border-[#E2E8E2]" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-white rounded-xl border border-[#E2E8E2]" />
            <div className="h-48 bg-white rounded-xl border border-[#E2E8E2]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !trader) {
    return (
      <div className="w-full min-w-0 max-w-full py-4">
        <Header />
        <hr className="border-[#E2E8E2]" />
        <div className="py-12 text-center">
          <h2 className="text-xl font-semibold text-[#1A2E1A]">
            {error?.message || t.traderDetail?.notFound || 'Trader not found'}
          </h2>
          <Link
            href="/admin/traderApproval"
            className="text-[#2A5A2A] hover:text-[#1B3D1B] mt-3 inline-flex items-center gap-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.traderDetail?.backToApprovals || 'Back to Approvals'}
          </Link>
        </div>
      </div>
    );
  }

  const displayTrader = toDisplayTrader(trader as Trader);
  const isPending = displayTrader.status === 'pending';

  return (
    <div className="w-full min-w-0 max-w-full py-4">
      <Header />
      <hr className="border-[#E2E8E2]" />
      <div className="space-y-6 py-4">
        <Link
          href="/admin/traderApproval"
          className="inline-flex items-center gap-2 text-[#6B7B6B] hover:text-[#1A2E1A] transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.traderDetail?.backToApprovals || 'Back to Approvals'}
        </Link>

        <div className="bg-white rounded-xl border border-[#E2E8E2] shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1A2E1A]">{displayTrader.businessName}</h1>
              <p className="text-[#6B7B6B] mt-1 text-sm">
                {t.traderDetail?.reviewApplication || 'Review trader application'}
              </p>
            </div>

            {isPending && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectionModal(true)}
                  disabled={actionInProgress}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {t.traderDetail?.reject || 'Reject'}
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionInProgress}
                  className="px-4 py-2 bg-[#2A5A2A] text-white rounded-lg hover:bg-[#1B3D1B] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {approveMutation.isPending
                    ? t.traderDetail?.approving || 'Approving...'
                    : t.traderDetail?.approveApplication || 'Approve Application'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          <div className="min-w-0">
            <BusinessInfoCard trader={displayTrader} />
          </div>
          <div className="min-w-0 max-w-md">
            <AdditionalInfoCard trader={displayTrader} />
          </div>
        </div>
      </div>

      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onConfirm={handleReject}
        isProcessing={rejectMutation.isPending}
      />
    </div>
  );
}
