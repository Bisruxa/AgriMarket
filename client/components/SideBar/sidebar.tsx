
"use client";
import React from "react";
import { UserPen, MessageCircleMore,Search } from "lucide-react";
import Link from "next/link";
import LogOutSection from "@/components/SideBar/LogOut";
import NavigationLink from "@/components/SideBar/NavigationLink";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";


interface LinkItem {
  name: string;
  icon: React.ReactNode;
  to: string;
}

interface SidebarProps {
  arr: LinkItem[];
  role: string;
}

const Sidebar = ({ arr, role }: SidebarProps) => {
  const pathname = usePathname();
  
  return (
    <div className="flex flex-col min-h-screen py-3">
      <div className="flex-1">
         <div className="space-y-5 text-center">
         <h1 className="text-[25px] font-extrabold text-[#2A5A2A]">
             AgriMarket           </h1>
           <div className="flex items-center  relative w-full max-w-sm">
             <Search className="text-black absolute left-2 top-1.5" size={25} />
            <Input
               className="focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-white w-full text-black/60 text-sm pl-10 py-1 border-none  rounded-md "
               type="text"
               placeholder="Search"
             />
           </div>
           </div>
        {/* NavigationLink now contains header, search, and general links */}
        <NavigationLink Links={arr} />
        
        <div>
          {
  (role=="Admin")?(
    <div className="mb-30">
          <h1 className="text-xs text-black/30 my-3 font-semibold">Support</h1>
          <div
            className="flex h-10 border border-[#2A5A2A]/60 text-[14px] items-center px-2 rounded-lg transition-colors duration-200 ease-in-out"
            style={{
              color:
                pathname.split("/").pop() === "chat"
                  ? "white"
                  : "rgba(0, 0, 0, 0.7)",
              backgroundColor:
                pathname.split("/").pop() === "chat" ? "#2A5A2A" : "",
            }}
          >
            <MessageCircleMore className="mr-2" size={20} />
            <Link className="w-full py-2.5" href={`/chat`}>
              Chat
            </Link>
          </div>
        </div>
  ):(
    <div>

          <h1 className="text-xs text-black/30 my-3 font-semibold">My Space</h1>
          <div
            className="flex text-[14px] border border-[#2A5A2A]/60 items-center px-2 rounded-lg transition-colors duration-200 ease-in-out"
            style={{
              color:
                pathname.split("/").pop() === "portfolio"
                  ? "white"
                  : "rgba(0, 0, 0, 0.7)",
              backgroundColor:
                pathname.split("/").pop() === "portfolio" ? "#2A5A2A" : "",
            }}
          >
            <UserPen className="mr-2" size={20} />
            <Link className="w-full py-2.5" href={`/${role}/portfolio`}>
              My Portfolio
            </Link>
          </div>
          
    </div>
  )
          }
       
        </div>
        
       
      </div>
      
      <div className="flex">
        <LogOutSection />
      </div>
    </div>
  );
};

export default Sidebar;