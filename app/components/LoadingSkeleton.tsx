interface LoadingSkeletonProps {
  type: 'card' | 'list' | 'table'
  count?: number
}

export default function LoadingSkeleton({ type, count = 3 }: LoadingSkeletonProps) {
  const renderCardSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderListSkeleton = () => (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderTableSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  switch (type) {
    case 'card':
      return renderCardSkeleton()
    case 'list':
      return renderListSkeleton()
    case 'table':
      return renderTableSkeleton()
    default:
      return renderListSkeleton()
  }
} 