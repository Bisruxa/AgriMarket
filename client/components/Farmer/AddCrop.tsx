"use client"
import React, { useEffect, useState, useContext } from 'react'
import { CropForm, CropFormData } from './CropForm'
import { api } from '@/lib/api'
import { Context } from '@/app/context/Context'
import {useAuth} from "@/app/context/UserContext";
interface AddCropProps {
  productId?: string | null
  onSuccess?: () => void
}

const AddCrop = ({ productId, onSuccess }: AddCropProps) => {
  const {user} = useAuth();
  const { setShow} = useContext(Context)!
  const [initialData, setInitialData] = useState<CropFormData | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProductData = async () => {
      if (productId) {
        setIsFetching(true)
        setSubmitError(null)
        try {
          const response = await api.get(`/products/${productId}`)
          if (response.success && response.data) {
            const product = response.data as any
            setInitialData({
              name: product.name,
              stock: product.stock?.toString() || product.amount?.toString() || "",
              price: product.price?.toString() || product.pricePerQuantal?.toString() || "",
              unit: product.unit || "KG",
              description: product.description || "",
              harvestDate: product.harvestDate?.split('T')[0] || "",
              expiryDate: product.expiryDate?.split('T')[0] || ""
            })
          } else {
            setSubmitError(response.message || 'Failed to load product data')
          }
        } catch (error) {
          console.error('Error fetching product:', error)
          setSubmitError('Failed to load product data. Please try again.')
        } finally {
          setIsFetching(false)
        }
      } else {
        setInitialData(undefined)
      }
    }

    fetchProductData()
  }, [productId])

  const handleSubmit = async (data: CropFormData) => {
    setSubmitError(null)
    setIsLoading(true)
    try {
      const payload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        unit: data.unit,
        category: 'VEGETABLES',
        stock: parseInt(data.stock),
        location: `${user?.region || 'Unknown'}, ${user?.woreda || 'Unknown'}`,
        isOrganic: true,
        harvestDate: data.harvestDate,
        expiryDate: data.expiryDate,
        images: []
      }
      
      let response
      
      if (productId) {
        response = await api.put(`/products/${productId}`, payload)
      } else {
        response = await api.post('/products', payload)
      }

      if (response.success) {
        onSuccess?.()
        setShow(false)
      } else {
        setSubmitError(response.message || 'Operation failed. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      setSubmitError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setShow(false)
  }

  if (isFetching) {
    return (
      <div className="h-[90vh] w-[55vw] my-6 mx-auto rounded-4xl bg-white flex items-center justify-center">
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
      errorMessage={submitError}
    />
  )
}

export default AddCrop