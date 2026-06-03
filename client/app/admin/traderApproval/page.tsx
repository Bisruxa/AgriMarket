'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import TraderStats from '@/components/cards/trader/traderStats';
import CTA from '@/app/farmer/market/CTA';
import TableFilter from '@/components/filters/TableFilter';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useAdminStats, usePendingTraders } from '@/components/hooks/userAdminQueries';
import { TableSkeleton } from '../LoadingState';
import { ErrorState } from '../ErrorState';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

type PendingTrader = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: string;
  registrationDate: string;
  status: string;
};

export default function TraderApprovalPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const t = useTranslations();

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();
  const {
    data: traders = [],
    isLoading: tradersLoading,
    error: tradersError,
    refetch: refetchTraders,
  } = usePendingTraders();

  const loading = statsLoading || tradersLoading;
  const error = statsError || tradersError;

  const filterOptions = [
    { value: 'all', label: t.filters?.status?.all || 'All Status' },
    { value: 'pending', label: t.filters?.status?.pending || 'Pending' },
    { value: 'approved', label: t.filters?.status?.approved || 'Approved' },
    { value: 'rejected', label: t.filters?.status?.rejected || 'Rejected' },
  ];

  const tableHeaders = [
    { key: 'businessName', label: t.traderTable?.businessName || 'Business Name' },
    { key: 'owner', label: t.traderTable?.owner || 'Owner' },
    { key: 'contact', label: t.traderTable?.contact || 'Contact' },
    { key: 'registrationDate', label: t.traderTable?.registrationDate || 'Registration Date' },
    { key: 'status', label: t.traderTable?.status || 'Status' },
    { key: 'action', label: t.traderTable?.action || 'Action' },
  ];

  const filteredTraders = useMemo(() => {
    return (traders as PendingTrader[]).filter((trader) => {
      const normalizedStatus = (trader.status || 'pending').toLowerCase();
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
      const matchesSearch =
        search === '' ||
        trader.businessName.toLowerCase().includes(search.toLowerCase()) ||
        trader.ownerName.toLowerCase().includes(search.toLowerCase()) ||
        trader.email.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [traders, search, statusFilter]);

  const getStatusBadge = (status: string) => {
    const normalized = (status || 'pending').toLowerCase();
    switch (normalized) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" /> {t.status?.approved || 'Approved'}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" /> {t.status?.rejected || 'Rejected'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" /> {t.status?.pending || 'Pending'}
          </span>
        );
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredTraders.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredTraders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="w-full min-w-0 max-w-full py-4">
        <Header />
        <hr className="border-[#E2E8E2]" />
        <div className="space-y-5 py-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2E1A]">
              {t.traderApproval?.title || 'Trader Approvals'}
            </h1>
            <p className="text-[#6B7B6B] mt-1 text-sm">
              {t.traderApproval?.subtitle || 'Review and manage trader registration requests'}
            </p>
          </div>
          <TraderStats stats={undefined} loading />
          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        error={error.message}
        onRetry={() => {
          refetchStats();
          refetchTraders();
        }}
      />
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full py-4">
      <Header />
      <hr className="border-[#E2E8E2]" />
      <div className="space-y-5 py-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E1A]">
            {t.traderApproval?.title || 'Trader Approvals'}
          </h1>
          <p className="text-[#6B7B6B] mt-1 text-sm">
            {t.traderApproval?.subtitle || 'Review and manage trader registration requests'}
          </p>
        </div>

        <TraderStats stats={stats} loading={false} error={null} />

        <TableFilter
          searchPlaceholder={
            t.traderApproval?.searchPlaceholder || 'Search by business name, owner, or email...'
          }
          onSearch={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          filterValue={statusFilter}
          onFilterChange={(value) => {
            setStatusFilter(value as StatusFilter);
            setCurrentPage(1);
          }}
          filterOptions={filterOptions}
        />

        <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-[#E2E8E2] bg-white shadow-sm">
            <table className="w-full table-fixed">
              <thead className="border-b border-[#E2E8E2] bg-[#F4F7F4]">
                <tr>
                  {tableHeaders.map((header) => (
                    <th
                      key={header.key}
                      className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7B6B] sm:px-4"
                    >
                      <span className="line-clamp-2">{header.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E2]">
                {currentData.map((trader) => (
                  <tr key={trader.id} className="transition-colors hover:bg-[#F4F7F4]/60">
                    <td className="px-3 py-3 sm:px-4">
                      <div className="truncate text-sm font-medium text-[#1A2E1A]">{trader.businessName}</div>
                      {trader.businessType ? (
                        <div className="truncate text-xs text-[#6B7B6B]">{trader.businessType}</div>
                      ) : null}
                    </td>
                    <td className="truncate px-3 py-3 text-sm text-[#1A2E1A] sm:px-4">{trader.ownerName}</td>
                    <td className="px-3 py-3 sm:px-4">
                      <div className="truncate text-sm text-[#1A2E1A]">{trader.email}</div>
                      <div className="truncate text-xs text-[#6B7B6B]">{trader.phone}</div>
                    </td>
                    <td className="truncate px-3 py-3 text-sm text-[#6B7B6B] sm:px-4">
                      {new Date(trader.registrationDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 sm:px-4">{getStatusBadge(trader.status)}</td>
                    <td className="px-3 py-3 sm:px-4">
                      <Link
                        href={`/admin/traderApproval/${trader.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#2A5A2A] hover:text-[#1B3D1B]"
                      >
                        <span className="truncate">{t.traderApproval?.review || 'Review'}</span>
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          {filteredTraders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#6B7B6B]">{t.common?.noResults || 'No traders found'}</p>
            </div>
          )}
        </div>

        {filteredTraders.length > 0 && (
          <CTA
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTraders.length}
            onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          />
        )}
      </div>
    </div>
  );
}
