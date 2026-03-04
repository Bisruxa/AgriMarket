"use client";
import Sidebar from "@/components/SideBar/sidebar";
import { Farmer_Links } from "@/lib/sidebarLinkContent";

const FarmerSidebar = () => {
  return (
    <>
      <Sidebar arr={Farmer_Links} role={"farmer"} />
    </>
  );
};

export default FarmerSidebar;
