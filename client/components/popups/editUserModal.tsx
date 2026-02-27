'use client';
import { X } from 'lucide-react';
import { User } from '@/types/auth-page';
import { useState } from 'react';
import { useTranslations } from '@/components/hooks/useTranlations';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

export default function EditUserModal({ user, onClose, onUpdate }: EditUserModalProps) {
  const [editedUser, setEditedUser] = useState<User>(user);
  const t = useTranslations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(editedUser);
  };

  const handleCancel = () => {
    setEditedUser(user); // Reset to original user data
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold">{t.modals?.editUser?.title || 'Edit User'}</h3>
          <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <input
            name="name"
            value={editedUser.name}
            onChange={e => setEditedUser({...editedUser, name: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#5B8C51] outline-none"
            placeholder={t.modals?.editUser?.namePlaceholder || 'Name'}
            required
          />
          <input
            name="email"
            type="email"
            value={editedUser.email}
            onChange={e => setEditedUser({...editedUser, email: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#5B8C51] outline-none"
            placeholder={t.modals?.editUser?.emailPlaceholder || 'Email'}
            required
          />
          <input
            name="phone"
            value={editedUser.phone}
            onChange={e => setEditedUser({...editedUser, phone: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#5B8C51] outline-none"
            placeholder={t.modals?.editUser?.phonePlaceholder || 'Phone'}
            required
          />
          <select
            value={editedUser.role}
            onChange={e => setEditedUser({...editedUser, role: e.target.value as 'FARMER' | 'TRADER'})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#5B8C51] outline-none"
          >
            <option value="FARMER">{t.roles?.farmer || 'Farmer'}</option>
            <option value="TRADER">{t.roles?.trader || 'Trader'}</option>
          </select>
          
          <div className="flex gap-2 pt-2">
            <button 
              type="button" 
              onClick={handleCancel} 
              className="flex-1 p-2 border rounded hover:bg-gray-50 transition-colors"
            >
              {t.common?.cancel || 'Cancel'}
            </button>
            <button 
              type="submit" 
              className="flex-1 p-2 bg-[#5B8C51] text-white rounded hover:bg-[#4a7342] transition-colors"
            >
              {t.common?.save || 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}