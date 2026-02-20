'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Factory, User, LogOut, Menu, TrendingUp, MessageCircle, Book, X } from "lucide-react";
import { NavItem } from "@/types/NavTypes";
import { useLanguage } from "@/app/context/LanguageContext";
import { useTranslations } from "../hooks/useTranlations";
const LogoComponent = () => (
  <h1 className="text-[25px] font-extrabold text-[#2F5632]">AgriMarket</h1>
);

const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isTrending, setIsTrending] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const t=useTranslations();

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

  const toggleIcon = (): void => {
    setIsTrending(!isTrending);
  };

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/signin");
    closeMenu();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return;
      }
      
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Navigation items configuration
  const navItems: NavItem[] = [
    { href: "/Dashboard", label:t.sidebar.dashboard, icon: Home, section: t.sidebar.general },
    { href: "/companies", label: t.sidebar.market, icon: Factory, section: t.sidebar.general },
    { 
      href: "#", 
      label: t.sidebar.trends, 
      icon: isTrending ? TrendingUp : Book, 
      section: t.sidebar.general,
      onClick: toggleIcon
    },
    { href: "/portifolio", label:t.sidebar.portfolio, icon: User, section: t.sidebar.accountPages },
    { href: "/chat", label: t.sidebar.chats, icon: MessageCircle, section: t.sidebar.support },
  ];

  const groupedItems = navItems.reduce((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <>
      <div className="w-full absolute text-black z-30">
        {/* Mobile Header */}
        <div className="bg-white top-0 w-full flex justify-between pb-1 fixed z-10 md:hidden h-20 items-center shadow-sm">
          <Link href="/" className="flex p-6 font-bold gap-2 text-xl">
            <LogoComponent />
          </Link>
          <div className="md:hidden p-4 z-50 relative mr-0">
            <button 
              ref={buttonRef}
              onClick={toggleMenu} 
              aria-label="Toggle menu"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={28} className="text-black" /> : <Menu size={28} className="text-black" />}
            </button>
          </div>
        </div>

        {/* Overlay - only shown on mobile when menu is open */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={closeMenu}
          />
        )}

        {/* Sidebar - Always visible on desktop, slides in on mobile */}
        <div
          ref={menuRef}
          className={`
            fixed md:flex flex-col justify-between bg-white top-0 left-0 bottom-0 w-64 text-gray-800 p-2 shadow-lg h-full text-sm overflow-y-auto z-40
            transition-transform duration-300 ease-in-out 
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
          `}
        >
          <div>
            <div className="flex p-6 font-bold gap-2 text-xl">
              <LogoComponent />
            </div>
            
            <hr className="my-2 border-0 h-px bg-linear-to-r from-transparent via-gray-300 to-transparent" />

            {/* Dynamic Navigation Sections */}
            {Object.entries(groupedItems).map(([section, items]) => (
              <div key={section}>
                <div className="flex pl-6">
                  <p className="text-gray-500 opacity-70 text-xs uppercase tracking-wider">{section}</p>
                </div>
                <ul className="p-3 pl-6 space-y-1">
                  {items.map((item) => (
                    item.href === "#" ? (
                      <li
                        key={item.label}
                        onClick={() => {
                          if (item.onClick) item.onClick();
                          if (window.innerWidth < 768) closeMenu();
                        }}
                        className="flex gap-3 p-3 hover:bg-[#2F5632] hover:text-white text-gray-700 rounded-lg cursor-pointer transition-all duration-300"
                      >
                        <div className="w-6 h-6 flex justify-center items-center">
                          <item.icon size={20} />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </li>
                    ) : (
                      <Link 
                        key={item.label} 
                        href={item.href} 
                        className="block"
                        onClick={() => {
                          if (window.innerWidth < 768) closeMenu();
                        }}
                      >
                        <li className="flex gap-3 p-3 hover:bg-[#2F5632] hover:text-white text-gray-700 rounded-lg transition-all duration-300">
                          <div className="w-6 h-6 flex justify-center items-center">
                            <item.icon size={20} />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </li>
                      </Link>
                    )
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Logout Section */}
          <div className="p-4 mt-auto border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex gap-3 p-3 hover:bg-[#2F5632] hover:text-white text-gray-700 rounded-lg cursor-pointer transition-all duration-300 w-full text-left"
            >
              <div className="w-6 h-6 flex justify-center items-center">
                <LogOut size={20} />
              </div>
            <span className="font-medium">{t.sidebar.logout}</span>
            </button>
          </div>
        </div>

        
      </div>
    </>
  );
};

export default Sidebar;