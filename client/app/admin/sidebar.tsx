"use client";
import React from "react";
import Sidebar from "@/components/SideBar/sidebar";
import { Admin_Links } from "@/lib/sidebarLinkContent";

const AdminSidebar = () => {
  return (
    <>
      <Sidebar arr={Admin_Links} role={"Admin"} />
    </>
  );
};


export default AdminSidebar;
