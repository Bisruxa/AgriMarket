import { Tractor, TrendingUp } from "lucide-react"

interface MarketTableProps {
  language: string
}

const marketData = [
  { 
    marketName: { en: "Guntur Market", am: "ጉንቱር ገበያ" },
    demandVolume: "1,280 quintals",
    demandTrend: { label: "+8%", up: true, value: "+8%" }, 
    currentPrice: "ETB 2,150/quintal",
    priceChange: "+3.2%",
    marketActivity: { en: "High", am: "ከፍተኛ" }
  },
  { 
    marketName: { en: "Vijayawada Market", am: "ቪጃያዋዳ ገበያ" },
    demandVolume: "2,100 quintals", 
    demandTrend: { label: "+15%", up: true, value: "+15%" }, 
    currentPrice: "ETB 2,230/quintal",
    priceChange: "+5.1%",
    marketActivity: { en: "Very High", am: "በጣም ከፍተኛ" }
  },
  { 
    marketName: { en: "Eluru Market", am: "ኤሉሩ ገበያ" },
    demandVolume: "940 quintals", 
    demandTrend: { label: "steady", up: false, value: "steady" }, 
    currentPrice: "ETB 2,020/quintal",
    priceChange: "+0.5%",
    marketActivity: { en: "Moderate", am: "መጠነኛ" }
  },
  { 
    marketName: { en: "Kurnool Market", am: "ኩርኑል ገበያ" },
    demandVolume: "1,520 quintals", 
    demandTrend: { label: "+5%", up: true, value: "+5%" }, 
    currentPrice: "ETB 2,090/quintal",
    priceChange: "+2.8%",
    marketActivity: { en: "High", am: "ከፍተኛ" }
  },
  { 
    marketName: { en: "Nellore Market", am: "ኔሎር ገበያ" },
    demandVolume: "1,750 quintals", 
    demandTrend: { label: "+11%", up: true, value: "+11%" }, 
    currentPrice: "ETB 2,180/quintal",
    priceChange: "+4.3%",
    marketActivity: { en: "High", am: "ከፍተኛ" }
  },
]

export const MarketTable = ({ language }: MarketTableProps) => {
  const getActivityColor = (activity: string) => {
    if (activity === 'Very High' || activity === 'በጣም ከፍተኛ') return 'bg-purple-100 text-purple-700'
    if (activity === 'High' || activity === 'ከፍተኛ') return 'bg-green-100 text-green-700'
    return 'bg-blue-100 text-blue-700'
  }

  const columns = [
    { header: { en: "Market Name", am: "የገበያ ስም" }, accessor: "marketName" as const },
    { header: { en: "Demand Volume", am: "የፍላጎት መጠን" }, accessor: "demandVolume" as const },
    { header: { en: "Demand Trend", am: "የፍላጎት አዝማሚያ" }, accessor: "demandTrend" as const },
    { header: { en: "Current Price", am: "የአሁኑ ዋጋ" }, accessor: "currentPrice" as const },
    { header: { en: "Price Change", am: "የዋጋ ለውጥ" }, accessor: "priceChange" as const },
    { header: { en: "Market Activity", am: "የገበያ እንቅስቃሴ" }, accessor: "marketActivity" as const },
  ]

  return (
    <div className="rounded-xl border border-[#bfdfce] bg-white overflow-hidden">
      <div className="border-b border-[#bfdfce] bg-[#f3faf6] px-4 py-3">
        <h3 className="font-semibold text-[#1f543c]">
          {language === "am" ? "የገበያ ፍላጎት ትንበያ" : "Market Demand Forecast"}
        </h3>
        <p className="text-xs text-[#57886c]">
          {language === "am" ? "በክልሎች ያለ የቀጥታ ገበያ መረጃ" : "Real-time market data across regions"}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#e6f3ec]">
            <tr>
              {columns.map((col) => (
                <th key={col.header.en} className="px-4 py-3 text-left text-xs font-semibold text-[#1f543c] border-b border-[#bfdfce]">
                  {language === "am" ? col.header.am : col.header.en}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {marketData.map((row, idx) => (
              <tr key={idx} className="border-b border-[#bfdfce] hover:bg-[#f3faf6] transition-colors">
                <td className="px-4 py-2.5 font-medium text-[#2a553d]">
                  {language === "am" ? row.marketName.am : row.marketName.en}
                </td>
                <td className="px-4 py-2.5 text-[#57886c]">{row.demandVolume}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    row.demandTrend.up ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {row.demandTrend.up ? '↑' : '→'} {row.demandTrend.label}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-medium text-[#1f6e4a]">{row.currentPrice}</td>
                <td className="px-4 py-2.5">
                  <span className={row.priceChange.startsWith('+') && row.priceChange !== '+0.5%' ? 'text-green-600' : 'text-yellow-600'}>
                    {row.priceChange}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getActivityColor(row.marketActivity.en)}`}>
                    {language === "am" ? row.marketActivity.am : row.marketActivity.en}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex flex-wrap gap-4 border-t border-[#bfdfce] bg-[#f3faf6] px-4 py-2 text-xs text-[#57886c]">
        <span className="flex items-center gap-1">
          <Tractor className="h-3 w-3" /> 
          {language === "am" ? "ቀጣይ መኸር: ግንቦት 18–25" : "Next harvest: May 18–25"}
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> 
          {language === "am" ? "በዋና ገበያዎች የ3 ወር ከፍታ" : "3-month high in major markets"}
        </span>
      </div>
    </div>
  )
}