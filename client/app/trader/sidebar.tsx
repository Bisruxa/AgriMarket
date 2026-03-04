"use client";
import React from "react";
import Sidebar from "@/components/SideBar/sidebar";
import { Trader_Links } from "@/lib/sidebarLinkContent";

const TraderSidebar = () => {
  return (
    <>
      <Sidebar arr={Trader_Links} role={"trader"} />
    </>
  );
};

export default TraderSidebar;
