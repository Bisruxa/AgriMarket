"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import {Table,TableHeader,TableBody,TableRow,TableHead,TableCell,} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CirclePlus, Pencil, Trash2 } from "lucide-react";
import CTA from "./CTA";
import { Context } from "@/app/context/Context";
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
import Header from "@/components/common/Header";

const ITEMS_PER_PAGE = 4;

const Page = () => {
  const {setShow} = useContext(Context)!;
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState(data);
  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = tableData.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleEdit = (rowIndex: number) => {
    const actualIndex = startIndex + rowIndex;
    const item = tableData[actualIndex];
    router.push(`/edit_crop?name=${encodeURIComponent(item[0])}&email=${encodeURIComponent(item[1])}&role=${encodeURIComponent(item[2])}&status=${encodeURIComponent(item[3])}`);
  };

  const handleDelete = (rowIndex: number) => {
    const actualIndex = startIndex + rowIndex;
    const newData = tableData.filter((_, index) => index !== actualIndex);
    setTableData(newData);
    
    const newTotalPages = Math.ceil(newData.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  };

  return (
    <>
     <Header></Header>
      <div className="flex justify-between mt-8">
       
        <div>
          <h1 className="font-bold text-2xl mb-2">Agricultural Products</h1>
          <p className="text-sm text-black/60">
            view, create and manage agricultural products
          </p>
        </div>
        <Button
          onClick={() =>setShow(true)}
          className="bg-[#2A5A2A] hover:bg-[#2A5A2A]/90 cursor-pointer"
        >
          <CirclePlus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      <div className="border border-[rgba(0,0,0,0.2)] mt-15 rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 py-4 font-extrabold uppercase text-black/60">Name</TableHead>
              <TableHead className="px-5 py-4 font-extrabold uppercase text-black/60">Amount</TableHead>
              <TableHead className="px-5 py-4 font-extrabold uppercase text-black/60">Price Per Quantal</TableHead>
              <TableHead className="px-5 py-4 font-extrabold uppercase text-black/60">Sold Amount(%)</TableHead>
              <TableHead className="px-5 py-4 font-extrabold uppercase text-black/60">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell
                    className="py-5 text-xs px-7 text-black/80"
                    key={cellIndex}
                  >
                    {cell}
                  </TableCell>
                ))}
                <TableCell className="py-5 text-xs px-7 text-black/80">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(rowIndex)}
                      className="h-8 px-3 text-xs border-gray-200 hover:bg-gray-50 hover:text-blue-600"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this item?")) {
                          handleDelete(rowIndex);
                        }
                      }}
                      className="h-8 px-3 text-xs border-gray-200 hover:bg-gray-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <CTA
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={tableData.length}
        onNext={handleNextPage}
        onPrev={handlePrevPage}
      />
    </>
  );
};

export default Page;