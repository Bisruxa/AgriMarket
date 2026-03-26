import React from 'react'
import { CropForm } from './CropForm'
const AddCrop = () => {
      const handleSubmit = (data: { crop: string; amount: string; price: string }) => {
    console.log("Form submitted:", data)
  }
  return (
     <CropForm/>
  )
}

export default AddCrop