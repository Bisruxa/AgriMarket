'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/common/Header';
import StatusCard from '@/components/cards/statusCard';
import EditUserModal from '@/components/popups/editUserModal';
import CTA from '@/app/farmer/market/CTA';
import TableFilter from '@/components/filters/TableFilter';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useAdminStats, useAllUsers, useUpdateUser } from '../../../components/hooks/userAdminQueries';
import { TableSkeleton } from '../../admin/LoadingState';
import { ErrorState } from '../../admin/ErrorState';
import { UserTable } from '../../admin/UserTable';
import { User } from '@/types/auth-page';

type UserRole = 'ALL' | 'FARMER' | 'TRADER';

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole>('ALL');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const t = useTranslations();
  
  // Extract data from the response
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();
  const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useAllUsers();
  
  // Extract the actual stats data
  // const stats = statsResponse?.data;

  const updateUserMutation = useUpdateUser();

  const isLoading = statsLoading || usersLoading;
  const error = statsError || usersError;

  const filterOptions = [
    { value: 'ALL', label: t.filters?.role?.all || "All Roles" },
    { value: 'FARMER', label: t.filters?.role?.farmer || "Farmers"},
    { value: 'TRADER', label: t.filters?.role?.trader || "Traders"}
  ];

  const filteredUsers = useMemo(() => 
    users.filter(u => 
      (role === 'ALL' || u.role === role) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
       u.email.toLowerCase().includes(search.toLowerCase()))
    ), [users, search, role]);

  const getRoleBadge = (role: string) => {
    const roleText = role === 'FARMER' 
      ? (t.filters?.role?.farmer || 'Farmer')
      : (t.filters?.role?.trader || 'Trader');
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${
        role === 'FARMER' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
      }`}>
        {roleText}
      </span>
    );
  };

  const handleUpdateUser = async (updatedUser: User) => {
    await updateUserMutation.mutateAsync(updatedUser);
    setEditingUser(null);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div>
        <Header />
        <hr />
        <div className="py-6 space-y-4">
          <StatusCard isLoading={true} />
          <TableSkeleton />
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div>
        <Header />
        <hr />
        <div className="py-6 space-y-4">
          <ErrorState 
            error={error.message} 
            onRetry={() => {
              refetchStats();
              refetchUsers();
            }} 
          />
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredUsers.slice(startIndex, endIndex);

  return (
    <div>
      <Header />
      <hr />
      <div className="py-6 space-y-4">
        {/* Pass the extracted stats data */}
        <StatusCard stats={stats} />
        
        <TableFilter
          searchPlaceholder={t.common?.search || "Search by name or email..."}
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

        <UserTable 
          users={currentData}
          onEdit={setEditingUser}
          getRoleBadge={getRoleBadge}
        />

        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onUpdate={handleUpdateUser}
          />
        )}

        <CTA
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          onNext={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          onPrev={() => setCurrentPage(p => Math.max(p - 1, 1))}
        />
      </div>
    </div>
  );
}