import React from "react";
import Link from "next/link";
import { Links } from "@/lib/sidebarLinkContent";
import { usePathname } from "next/navigation";
const NavigationLink = () => {
  const pathname  = usePathname();
  return (
    <div>
      <h1 className="text-xs text-black/30 my-3 font-semibold">General</h1>
      <ul className="text-sm space-y-2">
        {Links.map((one, index) => (
          <li
            className="flex text-[14px] border border-[#2A5A2A]/60 items-center px-2 rounded-lg transition-colors duration-200 ease-in-out"
            style={{
              color: pathname === one.to ? "white" : "rgba(0, 0, 0, 0.7)",
              backgroundColor: pathname === one.to ? "#2A5A2A" : "",
            }}
            key={index}
          >
            {one.icon}
            <Link className="w-full py-2.5" href={one.to}>
              {one.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavigationLink;
