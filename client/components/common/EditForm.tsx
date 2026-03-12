import React from 'react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const EditForm = ({Fields}) => {
  return (
     <form className="pt-6  px-7">
      <div className="grid grid-cols-2 gap-4">
        {Fields.map((one) => (
          <div className="space-y-2" key={one.id}>
            <Label>{one.label}</Label>
            <Input
              className="shadow-none focus-visible:ring-0 bg-black/5 focus-visible:ring-offset-0 focus:outline-none"
              id={one.id}
              type={one.type}
            />
          </div>
        ))}
        <Button className="bg-[rgb(172,197,167)] text-lg rounded-4xl mt-5 w-40 py-7 ml-65 transition duration-300 ease-in-out hover:bg-[#2A5A2A]">Save</Button>
      </div>
    </form>
  )
}

export default EditForm