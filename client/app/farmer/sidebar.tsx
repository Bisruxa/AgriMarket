"use client";
import React from "react";
import Sidebar from "@/components/SideBar/sidebar";
import { farmerLinks } from "@/lib/sidebarLinkContent";

const FarmerSidebar = () => {
  return (
    <>
      <Sidebar arr={farmerLinks} role={"farmer"} />
    </>
  );
};

export default FarmerSidebar;
