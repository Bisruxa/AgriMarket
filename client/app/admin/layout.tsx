/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from 'react';
import { ReactNode } from "react";
import AdminSidebar from './sidebar';

interface NodeProp {
  children: ReactNode;
}

const Framerlayout = ({ children }: NodeProp) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className="relative flex min-h-screen bg-black/1.5">
      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <div className={`
        ${isMobile ? 'fixed inset-0 z-50' : 'fixed top-0 left-0 h-full border-r border-black/6'}
      `}>
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className={`
        flex-1 min-h-screen px-3 py-2 flex flex-col
        ${isMobile ? 'w-full' : 'md:ml-64 lg:ml-72'}
        transition-all duration-300 ease-in-out
      `}>
        {/* Add padding-top for mobile header */}
        {isMobile && <div className="h-16" />}
        
        <div className="flex-1">
          {children}
        </div>
      
        {/* Footer */}
        <div className="flex items-center mt-4 space-x-1">
          <img className="w-5 h-5" src="/corn.avif" alt="cornImage" />
          <p className="text-black/70 text-xs">
            Ready to farm smarter? Grow with AgriMarket.
            <br />
            &copy;2026 AgriMarket
          </p>
        </div>
      </div>
    </div>
  );
};

export default Framerlayout;