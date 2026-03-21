import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserRound, X, Lock, Eye, EyeOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/app/context/UserContext';
import { InputFieldProps,SidebarButtonProps,PasswordForm,ShowPasswordState,ErrorsState,MessageState,UserProfilePopupProps } from '@/types/userProfile';


const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', value, onChange, error,  showPassword,  onTogglePassword }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input
        type={type === 'password' && showPassword ? 'text' : type}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2A5A2A]/20 focus:border-[#2A5A2A] outline-none pr-8"
      />
      {type === 'password' && onTogglePassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);



const SidebarButton: React.FC<SidebarButtonProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
      active ? 'bg-[#2A5A2A] text-white' : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <Icon size={14} className="inline mr-2" /> {label}
  </button>
);


const UserProfilePopup: React.FC<UserProfilePopupProps> = ({ isOpen, onClose }) => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState<ShowPasswordState>({ current: false, new: false, confirm: false });
  const [errors, setErrors] = useState<ErrorsState>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<MessageState>({ text: '', type: '' });
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && isOpen && onClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage({ text: '', type: '' });
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current) {
      setErrors({ current: 'Current password required' });
      return;
    }
    if (!passwordForm.new || passwordForm.new.length < 6) {
      setErrors({ new: 'Password must be at least 6 characters' });
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setErrors({ confirm: 'Passwords do not match' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ text: 'Password changed successfully', type: 'success' });
        setPasswordForm({ current: '', new: '', confirm: '' });
        setErrors({});
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } else {
        setErrors({ submit: data.message || 'Failed to change password' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div ref={popupRef} className="bg-white rounded-2xl shadow-2xl w-[750px] max-w-[90%] max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 pb-2 border-b">
          <h2 className="text-sm font-semibold text-gray-900">Profile & Password</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mx-5 mt-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message.text}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 border-r bg-gray-50/50 p-4">
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-[#2A5A2A] rounded-full flex items-center justify-center mx-auto mb-2">
                <UserRound size={28} className="text-white" />
              </div>
              <p className="font-medium text-gray-900 text-sm">{user?.name || 'Guest'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'Not signed in'}</p>
            </div>
            <div className="space-y-1">
              <SidebarButton 
                icon={UserRound} 
                label="Profile" 
                active={activeTab === 'profile'} 
                onClick={() => { setActiveTab('profile'); setErrors({}); }} 
              />
              <SidebarButton 
                icon={Lock} 
                label="Change Password" 
                active={activeTab === 'password'} 
                onClick={() => { setActiveTab('password'); setErrors({}); }} 
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 overflow-y-auto">
            {activeTab === 'profile' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Basic Information</h3>
                  <p className="text-xs text-gray-500 mt-1">View and edit your personal details</p>
                </div>
                {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}
                <InputField 
                  label="Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
                <InputField 
                  label="Email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Change Password</h3>
                  <p className="text-xs text-gray-500 mt-1">Update your password to keep your account secure</p>
                </div>
                {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}
                <InputField 
                  label="Current Password" 
                  type="password" 
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  showPassword={showPassword.current} 
                  error={errors.current}
                  onTogglePassword={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                />
                <InputField 
                  label="New Password" 
                  type="password" 
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  showPassword={showPassword.new} 
                  error={errors.new}
                  onTogglePassword={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                />
                <InputField 
                  label="Confirm Password" 
                  type="password" 
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  showPassword={showPassword.confirm} 
                  error={errors.confirm}
                  onTogglePassword={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50/50">
          <Button variant="outline" onClick={onClose} className="px-4">Cancel</Button>
          <Button 
            onClick={activeTab === 'profile' ? handleSaveProfile : handleChangePassword}
            disabled={isLoading}
            className="bg-[#2A5A2A] text-white hover:bg-[#1e421e] px-5 flex items-center gap-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>{activeTab === 'profile' ? 'Save Changes' : 'Change Password'}</>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserProfilePopup;