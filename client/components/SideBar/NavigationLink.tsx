'use client';
import Link from "next/link";
import { farmerLinks, adminLinks ,traderLinks} from "@/lib/sidebarLinkContent";
import { usePathname } from "next/navigation";
import { useTranslations } from "../hooks/useTranlations";
interface LinkItem {
  name: string;
  icon: React.ReactNode;
  to: string;
}

interface NavigationLinkProps {
  Links: LinkItem[];
}

const NavigationLink = ({ Links }: NavigationLinkProps) => {
  const pathname = usePathname();
 const t = useTranslations();
  return (
    <div>
      <h1 className="text-xs text-black/30 my-3 font-semibold">{t.sidebar.general}</h1>
      <ul className="text-sm space-y-2">
        {links.map((one, index) => {
          const isActive = pathname === one.to;
          return (
            <li
              className={`flex text-[14px] border border-[#2A5A2A]/60 items-center px-2 rounded-lg transition-colors duration-200 ease-in-out ${
                isActive ? 'bg-[#2A5A2A] text-white' : 'text-black/70 hover:bg-gray-50'
              }`}
              key={index}
            >
              <span className="mr-2">{one.icon}</span>
              <Link className="w-full py-2.5" href={one.to}>
                {one.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default NavigationLink;