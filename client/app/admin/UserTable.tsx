'use client'
import React from 'react';
import { Eye, User as UserIcon, Mail, Phone } from 'lucide-react';
import { User } from '@/types/auth-page';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  getRoleBadge: (role: string) => React.JSX.Element;
}

export const UserTable = ({ users, onEdit, getRoleBadge }: UserTableProps) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-linear-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
            <th className="px-6 py-4 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <UserIcon className="w-3.5 h-3.5" />
                Name
              </div>
            </th>
            <th className="px-6 py-4 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5" />
                Email
              </div>
            </th>
            <th className="px-6 py-4 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <Phone className="w-3.5 h-3.5" />
                Phone
              </div>
            </th>
            <th className="px-6 py-4 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Role
              </div>
            </th>
            <th className="px-6 py-4 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user, index) => (
            <tr 
              key={user.id} 
              className="group hover:bg-gray-50/80 transition-all duration-200 ease-in-out"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#5B8C51]/10 to-[#4a7342]/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-[#5B8C51]">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">{user.email}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">{user.phone || '—'}</span>
              </td>
              <td className="px-6 py-4">
                {getRoleBadge(user.role)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onEdit(user)} 
                    className="p-2 rounded-lg text-gray-400 hover:text-[#5B8C51] hover:bg-[#5B8C51]/10 transition-all duration-200 group/btn"
                    title="View user details"
                  >
                    <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  </button>
                 
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    {users.length === 0 && (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <UserIcon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium mb-1">No users found</p>

      </div>
    )}
  </div>
);