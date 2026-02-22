/* eslint-disable @next/next/no-img-element */
import React from "react";
import { MapPin } from "lucide-react";
import Profile from "./profile";
const Portfolio = () => {
  return (
    <>
      <div className="flex space-x-10 items-center">
        <div>
          <img
            src="https://static0.srcdn.com/wordpress/wp-content/uploads/2023/03/the-last-of-us-part-2-yara.jpg?q=50&fit=crop&w=825&dpr=1.5"
            alt="profile picture"
            className="object-cover w-40 h-40 rounded-full"
          />
        </div>
        <div className="w-170 justify-between flex items-center h-45 rounded-lg px-5 py-10 bg-[rgb(172,197,167)]">
          <div className="text-black space-y-2 w-48">
            <h2 className="text-2xl">Name</h2>
            <p className="flex px-2 py-2 bg-black/10 rounded-md text-black/80 items-center">
              <MapPin size={17} />
              Addis Ababa,Ethiopia
            </p>
          </div>
          <div className="flex flex-col relative pb-15 items-center">
            <img
              className="w-35 h-35"
              src="/icon-partly-cloudy.webp"
              alt="Weather Image"
            />
            <p className="absolute top-29 pl-4  font-bold text-3xl">28&deg;C</p>
          </div>
        </div>
      </div>
      <Profile></Profile>
    </>
  );
};

export default Portfolio;
