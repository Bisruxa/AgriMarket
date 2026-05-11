"use client";
import React from "react";
import Sidebar from "@/components/SideBar/sidebar";
import {traderLinks} from "@/lib/sidebarLinkContent";

const TraderSidebar = () => {
  return (
    <>
      <Sidebar arr={traderLinks} role={"trader"} />
    </>
  );
};

export default TraderSidebar;
