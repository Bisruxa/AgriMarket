"use client";
import React, { useState, useEffect, useRef } from "react";
import { MessageCircleMore, Menu, X } from "lucide-react";
import Link from "next/link";
import LogOutSection from "@/components/SideBar/LogOut";
import NavigationLink from "@/components/SideBar/NavigationLink";
import { usePathname } from "next/navigation";
import { useTranslations } from "../hooks/useTranlations";
interface LinkItem {
  name: string;
  icon: React.ReactNode;
  to: string;
}

interface SidebarProps {
  arr: LinkItem[];
  role: string;
}

// Move SidebarContent outside of the Sidebar component
const SidebarContent = ({ arr, role }: SidebarProps) => {
  const pathname = usePathname();
  const t = useTranslations();
  return (
    <>
      <div className="flex-1 flex flex-col">
        <div className="pb-4 text-center">
          <h1 className="text-[20px] sm:text-[25px] font-extrabold text-[#2A5A2A] break-words">
            AgriMarket
          </h1>
        </div>

        <div className="mt-2">
          <NavigationLink Links={arr} />
        </div>
        
        <div>
          {role === "Admin" ? (
            <div className="mt-8">
              <h1 className="text-xs text-black/30 mb-3 font-semibold tracking-wide uppercase">{t.sidebar.support}</h1>
              <div
                className="flex h-10 border border-[#2A5A2A]/60 text-[14px] items-center px-2 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer hover:bg-[#2A5A2A]/5"
                style={{
                  color: pathname.split("/").pop() === "chat"
                    ? "white"
                    : "rgba(0, 0, 0, 0.7)",
                  backgroundColor: pathname.split("/").pop() === "chat" ? "#2A5A2A" : "",
                }}
              >
                <MessageCircleMore className="mr-2 flex-shrink-0" size={20} />
                <Link className="w-full py-2.5" href={`/chat`}>
                  Chat
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              {/* <h1 className="text-xs text-black/30 my-3 font-semibold">{t.sidebar.myspace}</h1> */}
              {/* <div
                className="flex text-[14px] border border-[#2A5A2A]/60 items-center px-2 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer hover:bg-[#2A5A2A]/5"
                style={{
                  color: pathname.split("/").pop() === "portfolio"
                    ? "white"
                    : "rgba(0, 0, 0, 0.7)",
                  backgroundColor: pathname.split("/").pop() === "portfolio" ? "#2A5A2A" : "",
                }}
              >
                <UserPen className="mr-2 flex-shrink-0" size={20} />
                <Link className="w-full py-2.5" href={`/${role}/portfolio`}>
                 {t.sidebar.portfolio}
                </Link>
              </div> */}
              <div>
                <h1 className="text-xs text-black/30 mb-3 font-semibold tracking-wide uppercase">
                  {t.sidebar.support}
                </h1>
                <div
                  className="flex h-10 border border-[#2A5A2A]/60 text-[14px] items-center px-2 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer hover:bg-[#2A5A2A]/5"
                  style={{
                    color: pathname.split("/").pop() === "chat"
                      ? "white"
                      : "rgba(0, 0, 0, 0.7)",
                    backgroundColor: pathname.split("/").pop() === "chat" ? "#2A5A2A" : "",
                  }}
                >
                  <MessageCircleMore className="mr-2 flex-shrink-0" size={20} />
                  <Link className="w-full py-2.5" href={`/chat`}>
                    {t.sidebar.chats}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex mt-8 pt-4 border-t border-gray-200">
        <LogOutSection />
      </div>
    </>
  );
};

const Sidebar = ({ arr, role }: SidebarProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu when route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        if (
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target as Node) &&
          menuButtonRef.current &&
          !menuButtonRef.current.contains(event.target as Node)
        ) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-[20px] font-extrabold text-[#2A5A2A]">
          AgriMarket
        </h1>
        <button
          ref={menuButtonRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            ref={sidebarRef}
            className="md:hidden fixed top-0 left-0 bottom-0 w-[280px] sm:w-80 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto"
            style={{
              transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            }}
          >
            <div className="flex flex-col min-h-screen py-4 px-4">
              <SidebarContent arr={arr} role={role} />
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col min-h-screen py-3 px-4 w-75 lg:w-85 bg-white border-r border-gray-200">
        <SidebarContent arr={arr} role={role} />
      </div>
    </>
  );
};

export default Sidebar;