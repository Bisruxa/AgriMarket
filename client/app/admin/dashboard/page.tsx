'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/common/Header';
import StatusCard from '@/components/cards/statusCard';
import EditUserModal from '@/components/popups/editUserModal';
import CTA from '@/app/farmer/market/CTA';
import TableFilter from '@/components/filters/TableFilter';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useAdminStats, useAllUsers, useUpdateUser } from '@/components/hooks/userAdminQueries';
import { TableSkeleton } from '../LoadingState';
import { ErrorState } from '../ErrorState';
import { UserTable } from '../UserTable';
import { User } from '@/types/auth-page';

type UserRole = 'ALL' | 'FARMER' | 'TRADER';

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole>('ALL');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const t = useTranslations();

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();
  const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useAllUsers();
  const updateUserMutation = useUpdateUser();

  const isLoading = statsLoading || usersLoading;
  const error = statsError || usersError;

  const filterOptions = [
    { value: 'ALL', label: t.filters?.role?.all || 'All Roles' },
    { value: 'FARMER', label: t.filters?.role?.farmer || 'Farmers' },
    { value: 'TRADER', label: t.filters?.role?.trader || 'Traders' },
  ];

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          (role === 'ALL' || u.role === role) &&
          (u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()))
      ),
    [users, search, role]
  );

  const getRoleBadge = (userRole: string) => {
    const roleText =
      userRole === 'FARMER'
        ? t.filters?.role?.farmer || 'Farmer'
        : t.filters?.role?.trader || 'Trader';
    return (
      <span
        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
          userRole === 'FARMER' ? 'bg-green-100 text-[#2A5A2A]' : 'bg-blue-100 text-blue-800'
        }`}
      >
        {roleText}
      </span>
    );
  };

  const handleUpdateUser = async (updatedUser: User) => {
    await updateUserMutation.mutateAsync(updatedUser);
    setEditingUser(null);
  };

  if (isLoading) {
    return (
      <div className="w-full min-w-0 space-y-4 py-4">
        <Header />
        <hr className="border-[#E2E8E2]" />
        <StatusCard isLoading />
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-w-0">
        <ErrorState
          error={error.message}
          onRetry={() => {
            refetchStats();
            refetchUsers();
          }}
        />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full min-w-0 max-w-full py-4">
      <Header />
      <hr className="border-[#E2E8E2]" />
      <div className="space-y-5 py-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2E1A]">
            Farmers & Traders
          </h1>
          <p className="text-[#6B7B6B] mt-1 text-sm">
            Manage platform users and roles
          </p>
        </div>

        <div className="w-full min-w-0 max-w-full">
          <StatusCard stats={stats} />
        </div>

        <TableFilter
          searchPlaceholder={t.common?.search || 'Search by name or email...'}
          onSearch={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          filterValue={role}
          onFilterChange={(value) => {
            setRole(value as UserRole);
            setCurrentPage(1);
          }}
          filterOptions={filterOptions}
        />

        <UserTable users={currentData} onEdit={setEditingUser} getRoleBadge={getRoleBadge} />

        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onUpdate={handleUpdateUser}
          />
        )}

        {filteredUsers.length > 0 && (
          <CTA
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          />
        )}
      </div>
    </div>
  );
}
