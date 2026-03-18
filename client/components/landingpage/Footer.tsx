"use client";
import React, { useState } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "../hooks/useTranlations";
import { useLanguage } from "@/app/context/LanguageContext";
const Footer = () => {
  const [hoveredIcon, setHoveredIcon] = useState<null | string>(null);
  const t = useTranslations();
  const { language } = useLanguage();
  return (
    <footer
      className={`bg-[#2e3a2c] text-[#e4e5ba] pt-12 pb-6 px-4 md:px-8  ${language === "am" ? "amharic" : ""}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold">
                <span className="text-[#e4e5ba]">Agri Market</span>
              </h2>
            </div>
            <p className="text-[#e4e5ba] text-sm mb-4">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-[#e4e5ba]">
              <span>
                {language === "en"
                  ? "Final Year Project - Computer Science Department"
                  : "የመጨረሻ አመት ፕሮጀክት - የኮምፒዩተር ሳይንስ ክፍል"}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-400">
              {language === "en" ? "Quick Links" : "ፈጣን አገናኞች"}
            </h4>
            <ul className="space-y-2">
              {t.footer.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={
                      index === 0
                        ? "/"
                        : `/#${link.toLowerCase().replace(/\s+/g, "-")}`
                    }
                    className="text-[#e4e5ba] hover:text-[#5B8C51] transition-colors duration-300 text-sm flex items-center gap-2"
                  >
                    <span className="w-1 h-1  bg-[#668B57] rounded-full"></span>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-400">
              {language === "en" ? "Contact" : "አግኙን"}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#e4e5ba] text-sm">
                <Mail size={16} className="text-white" />
                <span>{t.footer.contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-[#e4e5ba] text-sm">
                <Phone size={16} className="text-white" />
                <span>{t.footer.contact.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-[#e4e5ba] text-sm">
                <MapPin size={16} className="text-white" />
                <span>{t.footer.contact.address}</span>
              </div>
            </div>

            <div className="mt-6">
              <h5 className="text-sm font-semibold mb-2 text-gray-400">
                {language === "en" ? "Project Team:" : "የፕሮጀክት ቡድን:"}
              </h5>
              <p className="text-xs text-[#e4e5ba]">{t.footer.teamMembers}</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-400">
              {t.footer.social}
            </h4>
            <div className="flex gap-4 mb-6">
              {[
                {
                  icon: <Facebook size={20} />,
                  name: "facebook",
                  color: "hover:text-blue-500",
                },
                {
                  icon: <Twitter size={20} />,
                  name: "twitter",
                  color: "hover:text-sky-400",
                },
                {
                  icon: <Instagram size={20} />,
                  name: "instagram",
                  color: "hover:text-pink-500",
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 ${
                    hoveredIcon === social.name
                      ? "bg-white/20 transform scale-110"
                      : ""
                  } ${social.color}`}
                  onMouseEnter={() => setHoveredIcon(social.name)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <h5 className="text-sm font-semibold mb-2 text-gray-400">
              {t.footer.projectInfo}
            </h5>
            <p className="text-xs text-[#e4e5ba]">
              {language === "en"
                ? "CoSc4411: Final Project I\nAdvisor: Mr. Leykun Birhanu\nDepartment of Computer Science"
                : "CoSc4411: የመጨረሻ ፕሮጀክት I\nአማካሪ: አቶ ለይኩን ብርሃኑ\nየኮምፒዩተር ሳይንስ ክፍል"}
            </p>
          </div>
        </div>

        <div className="border-t border-[#5B8C51]/20 my-6"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-[#e4e5ba] text-sm">{t.footer.copyright}</p>
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

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-[#e4e5ba] text-sm">
            <span>{t.footer.acknowledgement}</span>
          </div>
          <p className="text-xs text-[#e4e5ba] mt-2">
            {t.footer.academicDisclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
