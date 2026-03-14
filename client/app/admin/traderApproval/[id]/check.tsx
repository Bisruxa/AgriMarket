// app/admin/traderApproval/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import TraderStats from '@/components/cards/trader/traderStats';
import CTA from '@/app/farmer/market/CTA';
import TableFilter from '@/components/filters/TableFilter';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useAdminStats, usePendingTraders } from '../../../../components/hooks/userAdminQueries';
// import { LoadingState, ErrorState } from '@/components/admin/LoadingState';
import { getStatusBadge } from '../../../../components/admin/StatusBadge';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function TraderApprovalPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const t = useTranslations();

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();
  const { data: traders = [], isLoading: tradersLoading, error: tradersError, refetch: refetchTraders } = usePendingTraders();

  const isLoading = statsLoading || tradersLoading;
  const error = statsError || tradersError;

  const filterOptions = [
    { value: 'all', label: t.filters?.status?.all || 'All Status' },
    { value: 'pending', label: t.filters?.status?.pending || 'Pending' },
    { value: 'approved', label: t.filters?.status?.approved || 'Approved' },
    { value: 'rejected', label: t.filters?.status?.rejected || 'Rejected' }
  ];

  const tableHeaders = [
    { key: 'businessName', label: t.traderTable?.businessName || 'Business Name' },
    { key: 'owner', label: t.traderTable?.owner || 'Owner' },
    { key: 'contact', label: t.traderTable?.contact || 'Contact' },
    { key: 'registrationDate', label: t.traderTable?.registrationDate || 'Registration Date' },
    { key: 'status', label: t.traderTable?.status || 'Status' },
    { key: 'action', label: t.traderTable?.action || 'Action' }
  ];

  const filteredTraders = useMemo(() => 
    traders.filter(trader => {
      const matchesStatus = statusFilter === 'all' || trader.status === statusFilter;
      const matchesSearch = search === '' || 
        trader.businessName.toLowerCase().includes(search.toLowerCase()) ||
        trader.ownerName.toLowerCase().includes(search.toLowerCase()) ||
        trader.email.toLowerCase().includes(search.toLowerCase());
      
      return matchesStatus && matchesSearch;
    }), [traders, search, statusFilter]
  );

  // if (isLoading) return <LoadingState />;
  // if (error) return <ErrorState error={error.message} onRetry={() => { refetchStats(); refetchTraders(); }} />;

  const totalPages = Math.ceil(filteredTraders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredTraders.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <hr />
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t.traderApproval?.title || 'Trader Approvals'}</h1>
          <p className="text-gray-600 mt-1">{t.traderApproval?.subtitle || 'Review and manage trader registration requests'}</p>
        </div>

        <TraderStats stats={stats} loading={statsLoading} error={statsError?.message} />

        <TableFilter
          searchPlaceholder={t.traderApproval?.searchPlaceholder || "Search by business name, owner, or email..."}
          onSearch={setSearch}
          filterValue={statusFilter}
          onFilterChange={(value) => setStatusFilter(value as StatusFilter)}
          filterOptions={filterOptions}
        />

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {tableHeaders.map(header => (
                  <th key={header.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentData.map(trader => (
                <tr key={trader.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{trader.businessName}</div>
                    <div className="text-xs text-gray-500">{trader.businessType}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{trader.ownerName}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{trader.email}</div>
                    <div className="text-xs text-gray-500">{trader.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(trader.registrationDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{getStatusBadge(trader.status, t)}</td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/traderApproval/${trader.id}`} className="inline-flex items-center gap-1 text-sm text-[#5B8C51] hover:text-[#4a7342] font-medium">
                      {t.traderApproval?.review || 'Review'} <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTraders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">{t.common?.noResults || 'No traders found'}</p>
            </div>
          )}
        </div>

        <CTA
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTraders.length}
          onNext={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          onPrev={() => setCurrentPage(p => Math.max(p - 1, 1))}
        />
      </div>
    </div>
  );
}