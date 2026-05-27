import { Calendar } from "lucide-react"
import { useState } from "react"

interface DateRangePickerProps {
  dateRange: { startDate: string; endDate: string }
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void
  formatDateForDisplay: (date: string) => string
  language: string
}

export const DateRangePicker = ({
  dateRange,
  onDateRangeChange,
  formatDateForDisplay,
  language
}: DateRangePickerProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [localDateRange, setLocalDateRange] = useState(dateRange)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onDateRangeChange(localDateRange)
    setShowDatePicker(false)
  }

  return (
    <div className="mb-3 flex justify-end">
      <button
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="inline-flex items-center gap-2 rounded-lg border border-[#bfdfce] bg-white px-3 py-1.5 text-sm text-[#2a553d] hover:bg-[#e6f3ec] transition-colors"
      >
        <Calendar className="h-4 w-4" />
        {formatDateForDisplay(dateRange.startDate)} - {formatDateForDisplay(dateRange.endDate)}
      </button>

      {showDatePicker && (
        <div className="absolute right-0 top-12 z-10 w-80 rounded-lg border border-[#bfdfce] bg-white shadow-lg">
          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-3">
              <label className="block text-xs font-medium text-[#57886c] mb-1">
                {language === "am" ? "የመጀመሪያ ቀን" : "Start Date"}
              </label>
              <input
                type="date"
                value={localDateRange.startDate}
                onChange={(e) => setLocalDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full rounded-md border border-[#bfdfce] px-3 py-1.5 text-sm outline-none focus:border-[#1f6e4a]"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#57886c] mb-1">
                {language === "am" ? "የመጨረሻ ቀን" : "End Date"}
              </label>
              <input
                type="date"
                value={localDateRange.endDate}
                onChange={(e) => setLocalDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full rounded-md border border-[#bfdfce] px-3 py-1.5 text-sm outline-none focus:border-[#1f6e4a]"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-md bg-[#1f543c] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1f6e4a] transition-colors"
              >
                {language === "am" ? "ተግብር" : "Apply"}
              </button>
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="flex-1 rounded-md border border-[#bfdfce] px-3 py-1.5 text-sm font-medium text-[#57886c] hover:bg-[#e6f3ec] transition-colors"
              >
                {language === "am" ? "ዝጋ" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}