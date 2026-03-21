import React from "react";
import Profile from "@/components/common/Profile";
import EditForm from "@/components/common/EditForm";
import Header from "@/components/common/Header";
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
 
  
];
const Farmer_Portfolio = () => {
  return (
    <>
    <Header></Header>

      <EditForm Fields={farmerField}/>
    </>
  );
};

export default Farmer_Portfolio;
