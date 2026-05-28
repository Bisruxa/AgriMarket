"use client";
import React from "react";
import Sidebar from "@/components/SideBar/sidebar";
import {
  House,
  ReceiptText,
  ChartNoAxesCombined,
  Store,
  Sprout,
} from "lucide-react";
import { useTranslations } from "@/components/hooks/useTranlations";

const FarmerSidebar = () => {
  const t = useTranslations();
  const farmerLinks = [
    {
      name: t.sidebar.dashboard,
      icon: <House className="mr-2" size={20} />,
      to: "/farmer/dashboard",
    },
    {
      name: t.sidebar.myFarms,
      icon: <Sprout className="mr-2" size={20} />,
      to: "/farmer/farms",
    },
    {
      name: t.sidebar.cropRecommendations,
      icon: <ReceiptText className="mr-2" size={20} />,
      to: "/farmer/cropdetail",
    },
    {
      name: t.sidebar.trends,
      icon: <ChartNoAxesCombined className="mr-2" size={20} />,
      to: "/farmer/trends",
    },
    {
      name: t.sidebar.market,
      icon: <Store className="mr-2" size={20} />,
      to: "/farmer/market",
    },
  ];

  return (
    <>
      <Sidebar arr={farmerLinks} role={"farmer"} />
    </>
  );
};

export default FarmerSidebar;
