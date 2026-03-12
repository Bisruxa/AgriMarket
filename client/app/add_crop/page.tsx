import React from 'react'
import { CropForm } from '@/components/Farmer/CropForm'
const Add_Crop_Page = () => {
      const handleSubmit = (data: { crop: string; amount: string; price: string }) => {
    console.log("Form submitted:", data)
  }
  return (
    <>
     <CropForm/>
    </>
  )
}

export default Add_Crop_Page