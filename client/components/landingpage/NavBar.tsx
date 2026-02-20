'use client'
import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";
import { useTranslations } from "../hooks/useTranlations";
import { LanguageButton } from "../ui/languageButton";


const LogoComponent = () => (
  <div className="absolute top-6 left-8 z-50">
    <h1 className="text-[25px] font-extrabold text-white">AgriMarket</h1>
  </div>
);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const t = useTranslations();
  
  // Bilingual navigation items with proper typing
  const navItems = [
    {name:t.nav.about,link:"/about"},
    {name:t.nav.signup,link:"/signup"},
    {name:t.nav.login,link:"/signin"}
  ]
  return (
    <nav className={`fixed top-0 w-full z-50 py-4 px-6 md:px-10 flex justify-between items-center bg-opacity-50 backdrop-blur-lg text-white ${language === 'am' ? 'amharic' : ''}`}>
      {/* Logo */}
      <div className="flex p-4 font-bold gap-2 text-2xl md:text-3xl">
        <LogoComponent/>
      </div>

      {/* Desktop Menu with Language Toggle */}
      <div className="hidden md:flex space-x-6 text-sm md:text-base items-center">
        {navItems.map((item, index) => (
          <Link
            key={`${item.link}-${index}`}
            href={item.link}
            className="text-white font-medium hover:text-green-300 transition-colors duration-300 relative group"
          >
            {item.name}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-300 group-hover:w-full transition-all duration-300"></span>
          </Link>
        ))}
        
        {/* Language Toggle Button */}
        <div className="flex items-center">
                    <LanguageButton  />
                  </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden z-50 flex items-center gap-4">
        {/* Language Toggle Button for Mobile */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
          aria-label={language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
        >
          <Globe size={18} />
          <span className="text-xs font-medium">
            {language === 'en' ? 'አማ' : 'ENG'}
          </span>
        </button>
        
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-0 left-0 w-full h-full bg-black/10 backdrop-blur-lg z-40">
          {/* Mobile Menu Content */}
          <div className="absolute top-20 left-0 w-full px-6 py-4 flex flex-col space-y-4 bg-black/40 backdrop-blur-xl">
            {navItems.map((item, index) => (
              <Link
                key={`${item.name}-${index}`}
                href={item.link}
                onClick={() => setMenuOpen(false)}
                className="text-white font-medium hover:text-green-300 transition-colors duration-300 relative group py-3 text-lg"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-300 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;