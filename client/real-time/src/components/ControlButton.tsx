import React from 'react';

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const ControlButton: React.FC<ControlButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      // Use aspect-square to guarantee a perfect circle regardless of passed height utilities.
      // Force height to auto with !important to avoid conflicting h-* utilities from callers.
  className={`aspect-square rounded-full flex items-center justify-center text-3xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500/50 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none !h-auto ${className}`}
    >
      {children}
    </button>
  );
};

export default ControlButton;