import React from "react";
import Profile from "@/components/common/Profile";
import EditForm from "@/components/common/EditForm";
const farmerField = [
  {
    id: "firstname",
    name: "firstname",
    label: "First Name",
    type: "text",
  },
  {
    id: "lastname",
    name: "lastname",
    label: "Last Name",
    type: "text",
  },
  {
    id: "phonenumber",
    name: "phonenumber",
    label: "Phone Number",
    type: "tel",
  },
  {
    id: "location",
    name: "location",
    label: "Location ",
    type: "text",
  },
  {
    id: "farmsize",
    name: "farmsize",
    label: "Farm Size",
    type: "number",
  },
  {
    id: "farmtype",
    name: "farmtype",
    label: "Farming Type",
    type: "text",
  },
  {
    id: "experiance",
    name: "experiance",
    label: "Experinace in Farming ",
    type: "text",
  },
];
const Trader_Portfolio = () => {
  return (
    <>
      <Profile/>
      <EditForm Fields={farmerField}/>
    </>
  );
};

export default Trader_Portfolio;
