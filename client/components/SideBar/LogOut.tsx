import React from 'react'
import {Bell,LogOut } from "lucide-react"
import {Button} from "@/components/ui/button"
const LogOutSection = () => {
  return (
    <div className='flex justify-between items-center'>
        <div className='flex space-x-2 items-center'>
           {/* <img className='w-10 h-10 object-cover rounded-full' src="https://static0.srcdn.com/wordpress/wp-content/uploads/2023/03/the-last-of-us-part-2-yara.jpg?q=50&fit=crop&w=825&dpr=1.5" alt="profile Image" />
           <p className='text-black/80 text-sm '>Name</p> */}
        </div>
        <div className='flex '>
          <Button className='bg-white text-black hover:bg-[#2A5A2A] hover:text-white  '>
            <Bell size={20} />
          </Button>
          <Button className='bg-white text-black hover:bg-[#2A5A2A] hover:text-white'>
            <LogOut size={20}/>
          </Button>
        </div>
    </div>
  )
}

export default LogOutSection