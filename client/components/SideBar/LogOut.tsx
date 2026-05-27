import React, { useState } from 'react';
import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserProfilePopup from '../popups/userProfile';
import { useAuth } from '@/app/context/UserContext';

const LogOutSection: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const { user, logout, loading } = useAuth();

  const handleDivClick = (): void => {
    setIsPopupOpen(true);
  };

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    logout();
  };

  if (loading) {
    return (
      <div className='flex justify-between items-center w-full p-2'>
        <div className='flex space-x-2 items-center'>
          <div className='animate-pulse bg-gray-200 rounded-full w-6 h-6' />
          <div className='flex flex-col space-y-1'>
            <div className='animate-pulse bg-gray-200 h-4 w-24 rounded' />
            <div className='animate-pulse bg-gray-200 h-3 w-32 rounded' />
          </div>
        </div>
        <div className='animate-pulse bg-gray-200 rounded-md w-8 h-8' />
      </div>
    );
  }

  return (
    <>
      <div 
        className='flex justify-between items-center w-full cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-2'
        onClick={handleDivClick}
      >
        <div className='flex space-x-2 items-center'>
          <UserRound size={25} />
          <div className='flex flex-col'>  
            <p className='text-black/80 text-sm font-medium'>{user?.name || 'Guest'}</p>
            <p className='text-xs text-black/60'>{user?.email || 'Not signed in'}</p>
          </div>
        </div>
        <Button 
          className='bg-white text-black hover:bg-[#2A5A2A] hover:text-white'
          onClick={handleLogout}
        >
          <LogOut size={20} />
        </Button>
      </div>

      <UserProfilePopup 
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
};

export default LogOutSection;