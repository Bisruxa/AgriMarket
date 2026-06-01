"use client";
import React from "react";
import Sidebar from "@/components/SideBar/sidebar";
import {
  House,
  ReceiptText,
  ChartNoAxesCombined,
  Store,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "@/components/hooks/useTranlations";

const FarmerSidebar = () => {
  const t = useTranslations();
  const farmerLinks = [
    {
      name: t.sidebar.dashboard,
      icon: <House size={20} />,
      to: "/farmer/dashboard",
    },
    {
      name: t.sidebar.myFarms,
      icon: <Sprout size={20} />,
      to: "/farmer/farms",
    },
    {
      name: t.sidebar.cropRecommendations,
      icon: <ReceiptText size={20} />,
      to: "/farmer/cropdetail",
    },
    {
      name: t.sidebar.priceForecast,
      icon: <TrendingUp size={20} />,
      to: "/farmer/price-forecast",
    },
    {
      name: t.sidebar.trends,
      icon: <ChartNoAxesCombined size={20} />,
      to: "/farmer/trends",
    },
    {
      name: t.sidebar.market,
      icon: <Store size={20} />,
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
