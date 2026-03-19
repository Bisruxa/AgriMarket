"use client";
import React from "react";
import { UserPen,MessageCircleMore } from "lucide-react";
import Link from "next/link";
import LogOutSection from "@/components/SideBar/LogOut";
import NavigationLink from "@/components/SideBar/NavigationLink";
import { usePathname } from "next/navigation";
const Sidebar = ({role }: { role: string }) => {
  const pathname = usePathname();
  return (
    <div className="flex flex-col min-h-screen py-3">
      <div className="flex-1">
        <NavigationLink />
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
        <div className="mb-30">
          <h1 className="text-xs text-black/30 my-3 font-semibold">Support</h1>
          <div
            className="flex h-10 border border-[#2A5A2A]/60 text-[14px] items-center  px-2 rounded-lg transition-colors duration-200 ease-in-out"
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
            <Link className="w-full py-2.5 " href={`/chat`}>
              Chat
            </Link>
          </div>
        </div>
      </div>
      <div className="flex">
       <LogOutSection />
      </div>
    </div>
  );
};

export default Sidebar;
