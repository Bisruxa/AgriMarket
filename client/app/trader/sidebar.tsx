"use client";
import React from "react";
import Sidebar from "@/components/SideBar/sidebar";
import { House, ShoppingCart, ChartNoAxesCombined } from "lucide-react";
import { useTranslations } from "@/components/hooks/useTranlations";

const TraderSidebar = () => {
  const t = useTranslations();
  const traderLinks = [
    {
      name: t.sidebar.dashboard,
      icon: <House className="mr-2" size={20} />,
      to: "/trader/dashboard",
    },
    {
      name: t.sidebar.purchases,
      icon: <ShoppingCart className="mr-2" size={20} />,
      to: "/trader/purchases",
    },
    {
      name: t.sidebar.trends,
      icon: <ChartNoAxesCombined className="mr-2" size={20} />,
      to: "/trader/trends",
    },
  ];

  return (
    <>
      <Sidebar arr={traderLinks} role={"trader"} />
    </>
  );
};

export default TraderSidebar;
