export const TableSkeleton = () => (
  <div className="bg-white rounded-lg border overflow-hidden">
    <div className="animate-pulse">
      {/* Table Header */}
      <div className="bg-gray-50 px-4 py-3 border-b">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      
      {/* Table Rows */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center px-4 py-3 border-b">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded w-8"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
// export const StatsSkeleton = () => (
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//     {[...Array(3)].map((_, i) => (
//       <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
//         <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
//         <div className="h-8 bg-gray-200 rounded w-1/3"></div>
//       </div>
//     ))}
//   </div>
// );