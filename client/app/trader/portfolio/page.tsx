import React from "react";
import Profile from "@/components/common/Profile";
import EditForm from "@/components/common/EditForm";
const farmerField = [
  {
    id: "firstname",
    label: "First Name",
    type: "text",
  },
  {
    id: "lastname",
    label: "Last Name",
    type: "text",
  },
  {
    id: "phonenumber",
    label: "Phone Number",
    type: "tel",
  },
  {
    id: "location",
    label: "Location ",
    type: "text",
  },
  {
    id: "farmsize",
    label: "Farm Size",
    type: "number",
  },
  {
    id: "farmtype",
    label: "Farming Type",
    type: "text",
  },
  {
    id: "experiance",
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
