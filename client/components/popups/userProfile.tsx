import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserRound, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/app/context/UserContext';

interface UserProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditForm {
  name: string;
  email: string;
}

const UserProfilePopup: React.FC<UserProfilePopupProps> = ({ isOpen, onClose }) => {
  const { user, login } = useAuth();
  const [editForm, setEditForm] = useState<EditForm>({
    name: user?.name || '',
    email: user?.email || ''
  });
  const popupRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (user) {
  //     setEditForm({
  //       name: user.name || '',
  //       email: user.email || ''
  //     });
  //   }
  // }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
      // Add a class to body to help with z-index
      document.body.classList.add('popup-open');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
      document.body.classList.remove('popup-open');
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  const handleSave = () => {
    const updatedUser = {
      ...user,
      name: editForm.name,
      email: editForm.email
    };
    // login(updatedUser);
    onClose();
  };

  if (!isOpen) return null;

  // Render popup at the root level using portal with the highest z-index
  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      style={{ zIndex: 999999 }}
    >
      <div 
        ref={popupRef}
        className="bg-white rounded-lg shadow-xl w-96 max-w-[90%]"
        style={{ zIndex: 1000000, position: 'relative' }}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <UserRound size={48} className="text-gray-600" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setEditForm({...editForm, name: e.target.value})
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5A2A] focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setEditForm({...editForm, email: e.target.value})
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5A2A] focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          {user?.role && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <p className="text-sm text-gray-600 capitalize">{user.role}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 p-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#2A5A2A] text-white hover:bg-[#1e421e] px-4 py-2 flex items-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserProfilePopup;