import React from 'react'
import { SlidersHorizontal } from 'lucide-react';
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import FarmerList from './farmerList';
const Body = () => {
  return (
    <div className='mt-2 w-full rounded-lg'>
      <div className='w-full space-y-2 rounded-lg border bg-black/2 px-4 py-3 sm:px-5'>
        <div className='flex items-center space-x-2'>
          <SlidersHorizontal size={18} />
          <h3 className='text-md font-semibold'>Filter by:</h3>
        </div>
        <form className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <Input
            placeholder='Search Crop name or Farmer name'
            className='focus-visible:ring-0'
            type="text"
          />
          <Button className='cursor-pointer bg-[#2A5A2A] hover:bg-[#2A5A2A] sm:w-auto'>
            Search
          </Button>
        </form>
      </div>
      <div className='space-y-4 px-1 py-3 sm:px-3'>
        <FarmerList />
        <hr />
      </div>
    </div>
  )
}

export default Body