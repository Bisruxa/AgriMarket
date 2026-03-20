import React from "react";
import { useState } from "react";
interface MessageProps {
  status: number | string;
  message:string;
}
const Message = ({ status, message }:MessageProps) => {
  const [show, setShow] = useState(false);
  if (status === 200) {
    setTimeout(() => {
      setShow(true);
    }, 2000);
    setShow(false);
    return (
      <>
        {show && (
          <div className="w-40 h-20 bg-green-300 text-green-600 rounded-lg px-5 py-3 text-center">
            <h1>{message || "Action Completed Sucessfully"}</h1>
          </div>
        )}
      </>
    );
  }
  if (status === 500) {
    setTimeout(() => {
      setShow(true);
    }, 2000);
    setShow(false);
    return (
      <>
        {show && (
          <div className="w-40 h-20 bg-red-300 text-red-600 rounded-lg px-5 py-3 text-center">
            <h1>{message || "Somthing Went Wrong"}</h1>
          </div>
        )}
      </>
    );
  }
};

export default Message;
