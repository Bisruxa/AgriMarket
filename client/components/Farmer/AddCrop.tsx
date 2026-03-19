"use client"
import React, { useEffect, useState, useContext } from 'react'
import { CropForm, CropFormData } from './CropForm'
import { api } from '@/lib/api'
import { Context } from '@/app/context/Context'

interface AddCropProps {
  productId?: string | null
  onSuccess?: () => void
}

const AddCrop = ({ productId, onSuccess }: AddCropProps) => {
  const { setShow } = useContext(Context)!
  const [initialData, setInitialData] = useState<CropFormData | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    const fetchProductData = async () => {
      if (productId) {
        setIsFetching(true)
        try {
          const response = await api.get(`/products/${productId}`)
          if (response.success && response.data) {
            const product = response.data as any
            setInitialData({
              crop: product.name,
              amount: product.amount.toString(),
              price: product.pricePerQuantal.toString()
            })
          }
        } catch (error) {
          console.error("Error fetching product:", error)
          alert("Failed to load product data")
          setShow(false)
        } finally {
          setIsFetching(false)
        }
      } else {
        setInitialData(undefined)
      }
    }

    fetchProductData()
  }, [productId, setShow])

  const handleSubmit = async (data: CropFormData) => {
    setIsLoading(true)
    try {
      let response
      
      if (productId) {
        // Update existing product
        response = await api.put(`/api/api/products/${productId}`, {
          name: data.crop,
          amount: parseFloat(data.amount),
          pricePerQuantal: parseFloat(data.price)
        })
      } else {
        // Create new product
        response = await api.post('/api/products', {
          name: data.crop,
          amount: parseFloat(data.amount),
          pricePerQuantal: parseFloat(data.price),
          category: "VEGITABLES",
          available: true,
          soldAmount: 0
        })
      }

      if (response.success) {
        alert(productId ? "Product updated successfully!" : "Product created successfully!")
        onSuccess?.()
        setShow(false) // Close popup on success
      } else {
        alert(response.message || "Operation failed")
      }
    } catch (error) {
      alert("Network error. Please try again.")
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setShow(false)
  }

  if (isFetching) {
    return (
      <div className="h-[90vh] w-[45vw] my-6 mx-auto rounded-4xl bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#2a5a2a] border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product data...</p>
        </div>
      </div>
    )
  }

  return (
    <CropForm
      initialData={initialData}
      productId={productId || undefined}
      onSubmit={handleSubmit}
      onClose={handleClose}
      isLoading={isLoading}
    />
  )
}

export default AddCrop