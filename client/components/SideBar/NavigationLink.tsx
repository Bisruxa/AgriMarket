'use client';
import Link from "next/link";
import { farmerLinks, adminLinks } from "@/lib/sidebarLinkContent";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
const NavigationLink = () => {
  const pathname = usePathname();
  
  const getLinks = () => {
    if (pathname?.startsWith('/admin')) {
      return adminLinks;
    } else {
      return farmerLinks;
    }
  };
  
  const links = getLinks();

  return (
    <div>
      <div className="space-y-5 text-center">
              <h1 className="text-[25px] font-extrabold text-[#2A5A2A]">
                AgriMarket
              </h1>
              <div className="flex items-center  relative w-full max-w-sm">
                <Search className="text-black absolute left-2 top-1.5" size={25} />
                <Input
                  className="focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white w-full text-black/60 text-sm pl-10 py-1 border-none  rounded-md "
                  type="text"
                  placeholder="Search"
                />
              </div>
            </div>
      <h1 className="text-xs text-black/30 my-3 font-semibold">General</h1>
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