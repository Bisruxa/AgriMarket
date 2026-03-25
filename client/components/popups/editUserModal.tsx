'use client';
import { X, User, Mail, Phone, BadgeCheck } from 'lucide-react';
import { User as UserType } from '@/types/auth-page';
import { useState } from 'react';
import { useTranslations } from '@/components/hooks/useTranlations';

interface EditUserModalProps {
  user: UserType;
  onClose: () => void;
  onUpdate: (updatedUser: UserType) => void;
}

export default function EditUserModal({ user, onClose, onUpdate }: EditUserModalProps) {
  const [editedUser, setEditedUser] = useState<UserType>(user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(editedUser);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-800">{t.modals?.editUser?.title || 'Edit User'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Name */}
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <User size={12} className="text-[#5B8C51]" />
              {t.modals?.editUser?.namePlaceholder || 'Name'}
            </label>
            <input
              value={editedUser.name}
              onChange={e => setEditedUser({...editedUser, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-[#5B8C51] outline-none text-sm"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Mail size={12} className="text-[#5B8C51]" />
              Email
            </label>
            <input
              type="email"
              value={editedUser.email}
              onChange={e => setEditedUser({...editedUser, email: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-[#5B8C51] outline-none text-sm"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Phone size={12} className="text-[#5B8C51]" />
              Phone
            </label>
            <input
              value={editedUser.phone}
              onChange={e => setEditedUser({...editedUser, phone: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-[#5B8C51] outline-none text-sm"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <BadgeCheck size={12} className="text-[#5B8C51]" />
              Role
            </label>
            <select
              value={editedUser.role}
              onChange={e => setEditedUser({...editedUser, role: e.target.value as 'FARMER' | 'TRADER'})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-[#5B8C51] outline-none text-sm bg-white"
            >
              <option value="FARMER">Farmer</option>
              <option value="TRADER">Trader</option>
            </select>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-3 py-2 bg-[#5B8C51] text-white rounded-lg hover:bg-[#4A7342] text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}