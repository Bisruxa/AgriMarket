'use client'

import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

interface TableData {
  item: string
  category: string
  qty: number
  unit: string
  price: string
  total: string
  date: string
}

const SAMPLE_DATA: TableData[] = [
  {
    item: 'Laptop Computer',
    category: 'Electronics',
    qty: 2,
    unit: 'pcs',
    price: '$899.99',
    total: '$1,799.98',
    date: '2024-01-15',
  },
  {
    item: 'Office Chair',
    category: 'Furniture',
    qty: 4,
    unit: 'pcs',
    price: '$249.99',
    total: '$999.96',
    date: '2024-01-12',
  },
  {
    item: 'USB-C Cable',
    category: 'Accessories',
    qty: 10,
    unit: 'pack',
    price: '$12.99',
    total: '$129.90',
    date: '2024-01-10',
  },
  {
    item: 'Monitor Stand',
    category: 'Electronics',
    qty: 3,
    unit: 'pcs',
    price: '$45.99',
    total: '$137.97',
    date: '2024-01-08',
  },
  {
    item: 'Desk Lamp',
    category: 'Lighting',
    qty: 6,
    unit: 'pcs',
    price: '$34.50',
    total: '$207.00',
    date: '2024-01-05',
  },
  {
    item: 'Keyboard',
    category: 'Electronics',
    qty: 5,
    unit: 'pcs',
    price: '$79.99',
    total: '$399.95',
    date: '2024-01-01',
  },
]

type SortField = keyof TableData
type SortOrder = 'asc' | 'desc' | null

export default function PurchaseTable() {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else if (sortOrder === 'desc') {
        setSortOrder(null)
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }
  const sortedData = [...SAMPLE_DATA].sort((a, b) => {
    if (!sortField || !sortOrder) return 0

    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4 opacity-0 group-hover:opacity-30" />
    }

    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-gray-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-gray-600" />
    )
  }
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="my-3  flex items-center gap-2">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Purchases</h2>
          <p className="text-sm text-gray-500 mt-0.5">Latest transactions and orders</p>
        </div>
      </div>
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-200 bg-gray-50/50">
              {[
                { label: 'Item', field: 'item' as SortField },
                { label: 'Category', field: 'category' as SortField },
                { label: 'Qty', field: 'qty' as SortField },
                { label: 'Unit', field: 'unit' as SortField },
                { label: 'Price', field: 'price' as SortField },
                { label: 'Total', field: 'total' as SortField },
                { label: 'Date', field: 'date' as SortField },
              ].map(({ label, field }) => (
                <TableHead
                  key={field}
                  onClick={() => handleSort(field)}
                  className="px-6 py-4 cursor-pointer group hover:bg-gray-100/80 transition-colors font-semibold text-gray-700 text-sm uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    {label}
                    <SortIcon field={field} />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, index) => (
              <TableRow
                key={row.item}
                className={`group hover:bg-gray-50/80 transition-colors ${
                  index !== sortedData.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <TableCell className="px-6 py-4 font-medium text-gray-900 group-hover:text-gray-900">
                  <div className="flex items-center gap-2">
                    <span>{row.item}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {row.category}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-gray-700 font-medium">
                  {row.qty}
                </TableCell>
                <TableCell className="px-6 py-4 text-gray-600">
                  {row.unit}
                </TableCell>
                <TableCell className="px-6 py-4 text-gray-700">
                  {row.price}
                </TableCell>
                <TableCell className="px-6 py-4 font-semibold text-gray-900">
                  {row.total}
                </TableCell>
                <TableCell className="px-6 py-4 text-gray-600">
                  {new Date(row.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500 px-2">
        <span>Showing {sortedData.length} items</span>
        <span>Last updated today</span>
      </div>
    </div>
  )
}