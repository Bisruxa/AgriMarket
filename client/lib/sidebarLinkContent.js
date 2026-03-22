import { ChartNoAxesCombined, House,ReceiptText, Store,Clock } from 'lucide-react';
import React from 'react';
import { useTranslations } from '@/components/hooks/useTranlations';

export const farmerLinks = [
  {
    name: "Dashboard",
    icon: <House className='mr-2' size={20} />,
    to:"/farmer/dashboard"
  },
  {
    name: "Crop Recommendations",
    icon: <ReceiptText className='mr-2' size={20} />,
    to:"/farmer/cropdetail"
  },
  {
    name: "Trends and Forcast",
    icon: <ChartNoAxesCombined className='mr-2' size={20} />,
    to:"/farmer/trends"
  },
  {
    name: "Market Place",
    icon: <Store className='mr-2' size={20} />,
    to:"/farmer/market"
  }
];
export const Admin_Links = [
  {
    name: "Farmer & Traders",
    icon: <House className='mr-2' size={20} />,
    to: "/admin/dashboard"
  },
  {
    name: "Trader Approval",
    icon: <Clock className='mr-2' size={20} />,
    to: "/admin/traderApproval"
  },
 
 
];
export const Trader_Links = [
  {
    name: "Dashboard",
    icon: <House className='mr-2' size={20} />,
    to: "/trader/dashboard"
  },
  {
    name: "Trends and Forcast",
    icon: <ChartNoAxesCombined className='mr-2' size={20} />,
    to: "/trader/trends"
  },
  {
    name: "Purchases",
    icon: <Clock className='mr-2' size={20} />,
    to: "/trader/purchases"
  },
 
];
