'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Factory, User,  LogOut, Menu,TrendingUp,MessageCircle,Book} from "lucide-react";
import { NavItem } from "@/types/NavTypes";

const LogoComponent = () => (
  <div className="absolute top-6 left-8 z-50">
    <h1 className="text-[25px] font-extrabold text-[#2F5632]">AgriMarket</h1>
  </div>
);

const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isTrending, setIsTrending] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleIcon = (): void => {
    setIsTrending(!isTrending);
  };

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/signin");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigation items configuration
  const navItems: NavItem[] = [
    { href: "/Dashboard", label: "Dashboard", icon: Home, section: "General" },
    { href: "/companies", label: "Companies/Market", icon: Factory, section: "General" },
    { href: "#", label: "Trends", icon: isTrending ? TrendingUp : Book, section: "General",onClick: toggleIcon },
    { href: "/portifolio", label: "My Portfolio", icon: User, section: "Account Pages" },
    { href: "/chat", label: "Chats", icon: MessageCircle, section: "Support" },
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
      <div className="w-full absolute text-black">
        {/* Mobile Header */}
        <div className="bg-white  top-0 w-full flex justify-between pb-1 fixed z-10 md:hidden h-20 items-center">
          <Link href="/" className="flex p-6 font-bold gap-2 text-xl">
            <LogoComponent />
          </Link>
          <div className="md:hidden p-4 z-50 relative mr-0">
            <button onClick={toggleMenu} aria-label="Toggle menu">
              <Menu size={28} className="text-black" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div
          ref={menuRef}
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:flex flex-col justify-between bg-white top-0 left-0 bottom-0 w-64 text-white p-2 shadow-lg h-full fixed text-sm overflow-y-auto z-40`}
        >
          <div>
            <Link href="/" className="flex p-6 font-bold gap-2 text-xl">
              <LogoComponent />
            </Link>
            
            <hr className="my-2 border-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />

            {/* Dynamic Navigation Sections */}
            {Object.entries(groupedItems).map(([section, items]) => (
              <div key={section}>
                <div className="flex pl-6">
                  <p className="text-black opacity-50 text-sm">{section}</p>
                </div>
                <ul className="p-3 pl-6 gap-y-3">
                  {items.map((item) => (
                    item.href === "#" ? (
                      <li
                        key={item.label}
                        onClick={item.onClick}
                        className="flex gap-2 p-2 hover:bg-[#2F5632] hover:text-white text-black rounded cursor-pointer transition-all duration-300"
                      >
                        <div className="w-6 h-6 bg-opacity-30 rounded-md flex justify-center items-center">
                          <item.icon size={22} />
                        </div>
                        <h2 className="pt-1">{item.label}</h2>
                      </li>
                    ) : (
                      <Link key={item.label} href={item.href} className="block">
                        <li className="flex gap-2 p-2 hover:bg-[#2F5632] hover:text-white text-black rounded transition-all duration-300">
                          <div className="w-6 h-6 bg-opacity-30 rounded-md flex justify-center items-center">
                            <item.icon size={22} />
                          </div>
                          <h2 className="pt-1">{item.label}</h2>
                        </li>
                      </Link>
                    )
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Logout Section */}
          <div className="p-6 mt-auto">
            <button
              onClick={handleLogout}
              className="flex gap-2 p-2 hover:bg-[#2F5632] hover:text-white rounded cursor-pointer transition-all duration-300 w-full text-left mt-2"
            >
              <div className="w-6 h-6 bg-opacity-30 rounded-md flex justify-center items-center">
                <LogOut size={22} />
              </div>
              <h2 className="pt-1">Log out</h2>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;