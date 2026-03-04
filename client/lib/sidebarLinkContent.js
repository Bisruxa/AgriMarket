import { ChartNoAxesCombined, House, ReceiptText, Store ,ShoppingCart } from 'lucide-react';
import React from 'react';

export const Farmer_Links = [
  {
    name: "Dashboard",
    icon: <House className='mr-2' size={20} />,
    to:"/farmer/dashboard"
  },
  {
    name: "Crop Details / Insight",
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


export const Trader_Links = [
  {
    name: "Dashboard",
    icon: <House className='mr-2' size={20} />,
    to:"/trader/dashboard"
  },
  {
    name: "Purchase Details",
    icon: <ShoppingCart  className='mr-2' size={20} />,
    to:"/trader/purchases"
  },
  {
    name: "Trends and Forcast",
    icon: <ChartNoAxesCombined className='mr-2' size={20} />,
    to:"/trader/trends"
  },
];