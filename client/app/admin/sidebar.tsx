"use client";
import React from "react";
import Sidebar from "@/components/SideBar/sidebar";
import { adminLinks } from "@/lib/sidebarLinkContent";

const AdminSidebar = () => {
  return (
    <>
      <Sidebar arr={adminLinks} role={"Admin"} />
    </>
  );
};


export default AdminSidebar;
