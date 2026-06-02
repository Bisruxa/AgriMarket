'use client'
import React from 'react';
import { Eye, User as UserIcon, Mail, Phone } from 'lucide-react';
import { User } from '@/types/auth-page';
import { useTranslations } from '@/components/hooks/useTranlations';
interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  getRoleBadge: (role: string) => React.JSX.Element;
}


export const UserTable = ({ users, onEdit, getRoleBadge }: UserTableProps) =>{ 
    const t = useTranslations();
  return (

  <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="w-[28%] px-3 py-3 text-left sm:px-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600">
                <UserIcon className="h-3.5 w-3.5 shrink-0" />
                Name
              </div>
            </th>
            <th className="w-[32%] px-3 py-3 text-left sm:px-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                Email
              </div>
            </th>
            <th className="w-[18%] px-3 py-3 text-left sm:px-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                Phone
              </div>
            </th>
            <th className="w-[12%] px-3 py-3 text-left sm:px-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Role</span>
            </th>
            <th className="w-[10%] px-3 py-3 text-left sm:px-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user, index) => (
            <tr 
              key={user.id} 
              className="group transition-colors hover:bg-gray-50/80"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td className="px-3 py-3 sm:px-4">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5B8C51]/10">
                    <span className="text-sm font-medium text-[#5B8C51]">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="truncate text-sm font-medium text-gray-900">{user.name}</span>
                </div>
              </td>
              <td className="px-3 py-3 sm:px-4">
                <span className="block truncate text-sm text-gray-600">{user.email}</span>
              </td>
              <td className="px-3 py-3 sm:px-4">
                <span className="block truncate text-sm text-gray-600">{user.phone || '—'}</span>
              </td>
              <td className="px-3 py-3 sm:px-4">
                {getRoleBadge(user.role)}
              </td>
              <td className="px-3 py-3 sm:px-4">
                <button 
                  type="button"
                  onClick={() => onEdit(user)} 
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#5B8C51]/10 hover:text-[#5B8C51]"
                  title="View user details"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    
    {users.length === 0 && (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <UserIcon className="h-8 w-8 text-gray-400" />
        </div>
        <p className="font-medium text-gray-600">No users found</p>
      </div>
    )}
  </div>
)};
