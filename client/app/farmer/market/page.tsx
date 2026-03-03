"use client";

import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import CTA from "./CTA";

const data: string[][] = [
  ["John", "john@gmail.com", "Admin", "Active"],
  ["Sarah", "sarah@gmail.com", "User", "Inactive"],
  ["Michael", "michael@gmail.com", "Editor", "Active"],
  ["Emma", "emma@gmail.com", "User", "Pending"],
  ["David", "david@gmail.com", "Admin", "Active"],
  ["Lisa", "lisa@gmail.com", "Editor", "Pending"],
  ["James", "james@gmail.com", "User", "Active"],
  ["Anna", "anna@gmail.com", "Admin", "Inactive"],
];

const ITEMS_PER_PAGE = 4;

const Page = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = data.slice(startIndex, endIndex);
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  return (
    <>
      <div className="flex justify-between ">
        <div>
          <h1 className="font-bold text-2xl mb-2">Agricultural Products</h1>
          <p className="text-sm text-black/60">
            view, create and manage agricultural products
          </p>
        </div>
        <Button className="bg-[#2A5A2A] hover:bg-[#2A5A2A] cursor-pointer">
          <CirclePlus />
          Create New
        </Button>
      </div>
      <div className="border border-[rgba(0,0,0,0.2)] mt-7 rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-7 py-4">Name</TableHead>
              <TableHead className="px-7 py-4">Amount</TableHead>
              <TableHead className="px-7 py-4">Price Per Quantal</TableHead>
              <TableHead className="px-7 py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell className="py-5 text-xs px-7 text-black/80" key={cellIndex}>
                    {cellIndex !== 3 ? ( cell) : ( <Button className="bg-transparent cursor-pointer text-black hover:bg-transparent"> ...</Button>)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <CTA currentPage={currentPage} totalPages={totalPages} totalItems={data.length} onNext={handleNextPage} onPrev={handlePrevPage}/>
     

  
    </>
  );
};

export default Page;