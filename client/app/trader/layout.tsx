/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { ReactNode } from "react";
import TraderSidebar from "./sidebar";
import FixedTopBar from "@/components/ui/FixedTopBar";
import { useLanguage } from "../context/LanguageContext";
import { useTranslations } from "@/components/hooks/useTranlations";

interface NodeProp {
  children: ReactNode;
}

const Framerlayout = ({ children }: NodeProp) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { language } = useLanguage();
  const t = useTranslations();
  const layoutT = t.dashboard.layout;
  const amharicClass = language === "am" ? "amharic" : "";

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
        <TraderSidebar />
      </div>

      {/* Main Content */}
      <div className={`
        flex-1 min-h-screen px-3 py-2  flex flex-col
        ${isMobile ? 'w-full' : 'md:ml-60'}
        transition-all duration-300 ease-in-out
        ${amharicClass}
      `}>
        {/* Add padding-top for mobile header */}
        {isMobile && <div className="h-16" />}

        <FixedTopBar isMobile={isMobile} />

        <div className="flex-1 -mt-1">
          {children}
        </div>

        {/* Footer */}
        <div className="flex items-center mt-4 space-x-1">
          <img className="w-5 h-5" src="/corn.avif" alt="cornImage" />
          <p className="text-black/70 text-xs">
            {layoutT.footerTagline}
            <br />
            {layoutT.copyright}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Framerlayout;