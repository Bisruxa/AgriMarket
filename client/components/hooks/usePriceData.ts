/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react"
import { type AppLanguage, formatAppMonthDay } from "@/lib/formatDate"

interface PriceDataPoint {
  date: string
  price: number
}

export const usePriceData = (language: string) => {
  const lang = (language === "am" ? "am" : "en") as AppLanguage
  const [priceData, setPriceData] = useState<{ label: string; value: number; fullDate: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getApiCropName = (crop: string): string => {
    const cropMap: Record<string, string> = {
      teff: "teff",
      barley: "barley",
      wheat: "wheat",
      sorghum: "sorghum",
      corn: "maize",
      maize: "maize",
    }
    return cropMap[crop] || crop
  }

  const fetchPriceData = useCallback(async (crop: string, startDate: string, endDate: string) => {
    setIsLoading(true)
    setError(null)
    
    const apiCrop = getApiCropName(crop)
    
    const requestBody = {
      crop: apiCrop,
      start_date: startDate,
      end_date: endDate,
    }

    try {
      console.log("Fetching from API:", requestBody)
      
      // REAL API CALL - NO MOCK DATA
      const response = await fetch("https://apache-resolutions-spreading-asn.trycloudflare.com/api/predict/price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`)
      }

      const data: PriceDataPoint[] = await response.json()
      console.log("API Response:", data)
      
      // Validate that we received data
      if (!data || data.length === 0) {
        throw new Error("No data received from API")
      }
      
      // Transform API data to match component format
      const transformedData = data.map(point => ({
        label: formatAppMonthDay(point.date, lang),
        value: point.price,
        fullDate: point.date
      }))
      
      setPriceData(transformedData)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch price data:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch price data"
      setError(errorMessage)
      setPriceData([]) // Clear any existing data
    } finally {
      setIsLoading(false)
    }
  }, [lang])

  return { priceData, isLoading, error, fetchPriceData }
}