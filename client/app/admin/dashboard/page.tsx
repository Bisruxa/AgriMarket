'use client';

import { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import Header from '@/components/common/Header';
import StatusCard from '@/components/cards/statusCard';
import EditUserModal from '@/components/popups/editUserModal';
import { MOCK_USERS } from '@/lib/mockUser';
import CTA from '@/app/farmer/market/CTA';
import TableFilter from '@/components/filters/TableFilter';
import { User } from '@/types/auth-page';
import { useTranslations } from '@/components/hooks/useTranlations';
type UserRole = 'ALL' | 'FARMER' | 'TRADER';

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole>('ALL');
  const [users, setUsers] = useState(MOCK_USERS);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const t = useTranslations()
  // Filter options for users
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

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredUsers.slice(startIndex, endIndex);

  return (
    <div>
      <Header />
      <hr />
      <div className="py-6 space-y-4">
        <StatusCard />
        
        {/* Reusable Filter Component */}
        <TableFilter
          searchPlaceholder= {t.common.search}
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

        {/* Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">{t.table.headers.name}</th>
                <th className="px-4 py-3 text-left">{t.table.headers.email}</th>
                <th className="px-4 py-3 text-left">{t.table.headers.phone}</th>
                <th className="px-4 py-3 text-left">{t.table.headers.role}</th>
                <th className="px-4 py-3 text-left">{t.table.headers.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentData.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{u.name}</td>
                  <td className="px-4 py-3 text-sm">{u.email}</td>
                  <td className="px-4 py-3 text-sm">{u.phone}</td>
                  <td className="px-4 py-3 text-sm">{getRoleBadge(u.role)}</td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => setEditingUser(u)} 
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="View user"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onUpdate={(updated) => {
              setUsers(users.map(u => u.id === updated.id ? updated : u));
              setEditingUser(null);
            }}
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