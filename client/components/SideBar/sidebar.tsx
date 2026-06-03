"use client";
import React, { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import LogOutSection from "@/components/SideBar/LogOut";
import NavigationLink from "@/components/SideBar/NavigationLink";
import AnimatedChatIcon from "@/components/icons/AnimatedChatIcon";
import { usePathname } from "next/navigation";
import { useTranslations } from "../hooks/useTranlations";
import { useLanguage } from "@/app/context/LanguageContext";

interface LinkItem {
  name: string;
  icon: React.ReactNode;
  to: string;
}

interface SidebarProps {
  arr: LinkItem[];
  role: string;
}

function ChatNavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-10 w-full items-center rounded-lg border border-[#2A5A2A]/60 px-2.5 text-sm transition-colors duration-200 ease-in-out hover:bg-[#2A5A2A]/5 ${
        active ? "bg-[#2A5A2A] text-white" : "text-black/70"
      }`}
    >
      <AnimatedChatIcon size={20} />
      <span className="py-2">{label}</span>
    </Link>
  );
}

const SidebarContent = ({ arr, role }: SidebarProps) => {
  const pathname = usePathname();
  const t = useTranslations();
  const { language } = useLanguage();
  const chatActive = pathname.split("/").pop() === "chat";

  return (
    <div
      className={`flex h-full min-h-0 flex-col ${language === "am" ? "amharic" : ""}`}
    >
      <div className="shrink-0 pb-3 text-center">
        <h1 className="text-xl font-extrabold text-[#2A5A2A] break-words">
          AgriMarket
        </h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mt-2">
          <NavigationLink Links={arr} />
        </div>

        {(role === "farmer" || role === "Admin") && (
          <div className="mt-6">
            <h1 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/30">
              {t.sidebar.support}
            </h1>
            <ChatNavItem
              href="/chat"
              label={role === "Admin" ? "Chat" : t.sidebar.chats}
              active={chatActive}
            />
          </div>
        )}
      </div>

      <div className="mt-auto shrink-0 border-t border-gray-200 pt-3">
        <LogOutSection />
      </div>
    </div>
  );
};

const Sidebar = ({ arr, role }: SidebarProps) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <div className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm md:hidden">
        <h1 className="text-[20px] font-extrabold text-[#2A5A2A]">AgriMarket</h1>
        <button
          ref={menuButtonRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            ref={sidebarRef}
            className="fixed top-0 bottom-0 left-0 z-50 w-[280px] overflow-hidden bg-white shadow-xl sm:w-80 md:hidden"
          >
            <div className="flex h-full flex-col px-4 pb-4 pt-16">
              <SidebarContent arr={arr} role={role} />
            </div>
          </div>
        </>
      )}

      <div className="hidden h-screen w-60 shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white py-3 px-3.5 md:flex">
        <SidebarContent arr={arr} role={role} />
      </div>
    </>
  );
};

export default Sidebar;
