import React from 'react'
import { Tractor,SlidersHorizontal  } from 'lucide-react';
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import FarmerList from './farmerList';
const Body = () => {
  return (
    <div className=' w-full h-60 mt-2 rounded-lg'>
       <div className='w-full border py-2 px-5 rounded-lg space-y-1 bg-black/2 '>
          <div className='flex items-center space-x-2'>
            <SlidersHorizontal size={18}/>
            <h3 className='text-md font-semibold'>Filter by:</h3>
          </div>
          <form className='flex space-x-2'>
             <Input placeholder='Search Crop name or Farmer name' className='focus-visible:ring-0' type="text" />
             <Button className='bg-[#2A5A2A] hover:bg-[#2A5A2A] cursor-pointer'>Search</Button>
          </form>
       </div>
       <div className='px-3 py-2 space-y-4'>
            <FarmerList/>
            <hr/>
       </div>
    </div>
  )
}

export default Body