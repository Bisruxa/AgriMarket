'use client'
import React, { useState } from "react";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "../hooks/useTranlations";
import { useLanguage } from "@/app/context/LanguageContext";
const Footer = () => {
  const [hoveredIcon, setHoveredIcon] = useState<null|string>(null);
  const t = useTranslations()
  const {language} = useLanguage();
  return (
    <footer className={`bg-linear-to-b from-[#0A1F0A] to-[#142814] text-white pt-12 pb-6 px-4 md:px-8 border-t border-[#5B8C51]/30 ${language === 'am'?'amharic':''}`}>
      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-linear-to-r from-[#5B8C51] to-[#3A6B31] flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌾</span>
              </div>
              <h2 className="text-2xl font-bold">
                <span className="text-white">Agri</span>
                <span className="bg-linear-to-r from-[#5B8C51] to-[#A3D9A5] bg-clip-text text-transparent">
                  Market
                </span>
              </h2>
            </div>
            <p className="text-gray-300 text-sm mb-4">
             {t.footer.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <GraduationCap size={16} />
            <span>{language === 'en' ? 'Final Year Project - Computer Science Department' : 'የመጨረሻ አመት ፕሮጀክት - የኮምፒዩተር ሳይንስ ክፍል'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
           <h4 className="text-lg font-semibold mb-4 text-white">
              {language === 'en' ? 'Quick Links' : 'ፈጣን አገናኞች'}
            </h4>
            <ul className="space-y-2">
              {t.footer.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={index === 0 ? "/" : `/#${link.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-gray-300 hover:text-[#5B8C51] transition-colors duration-300 text-sm flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-[#5B8C51] rounded-full"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
         <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              {language === 'en' ? 'Contact' : 'አግኙን'}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <Mail size={16} className="text-[#5B8C51]" />
                <span>{t.footer.contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <Phone size={16} className="text-[#5B8C51]" />
                <span>{t.footer.contact.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <MapPin size={16} className="text-[#5B8C51]" />
                <span>{t.footer.contact.address}</span>
              </div>
            </div>
            
            {/* Team Members */}
           <div className="mt-6">
              <h5 className="text-sm font-semibold mb-2 text-gray-300">
                {language === 'en' ? 'Project Team:' : 'የፕሮጀክት ቡድን:'}
              </h5>
              <p className="text-xs text-gray-400">
                {t.footer.teamMembers}
              </p>
            </div>
          </div>

          {/* Social & Links */}
           <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              {t.footer.social}
            </h4>
            <div className="flex gap-4 mb-6">
              {[
                { icon: <Facebook size={20} />, name: "facebook", color: "hover:text-blue-500" },
                { icon: <Twitter size={20} />, name: "twitter", color: "hover:text-sky-400" },
                { icon: <Instagram size={20} />, name: "instagram", color: "hover:text-pink-500" },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 ${
                    hoveredIcon === social.name ? 'bg-white/20 transform scale-110' : ''
                  } ${social.color}`}
                  onMouseEnter={() => setHoveredIcon(social.name)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            
            {/* Project Info */}
            <div className="bg-white/5 p-4 rounded-lg">
              <h5 className="text-sm font-semibold mb-2 text-white">{t.footer.projectInfo}</h5>
              <p className="text-xs text-gray-400">
                {language === 'en' 
                  ? 'CoSc4411: Final Project I\nAdvisor: Mr. Leykun Birhanu\nDepartment of Computer Science'
                  : 'CoSc4411: የመጨረሻ ፕሮጀክት I\nአማካሪ: አቶ ለይኩን ብርሃኑ\nየኮምፒዩተር ሳይንስ ክፍል'}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#5B8C51]/20 my-6"></div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              {t.footer.copyright}
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-400 hover:text-[#5B8C51] transition-colors duration-300">
              {language === 'en' ? 'Privacy Policy' : 'የግላዊነት ፖሊሲ'}
            </Link>
            <Link href="/" className="text-gray-400 hover:text-[#5B8C51] transition-colors duration-300">
              {language === 'en' ? 'Terms of Service' : 'የአገልግሎት ውሎች'}
            </Link>
            <Link href="/" className="text-gray-400 hover:text-[#5B8C51] transition-colors duration-300">
              {language === 'en' ? 'Documentation' : 'ሰነድ'}
            </Link>
          </div>
        </div>

        {/* Acknowledgement */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Heart size={14} className="text-red-400" />
            <span>{t.footer.acknowledgement}</span>
            <Heart size={14} className="text-red-400" />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {t.footer.academicDisclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;