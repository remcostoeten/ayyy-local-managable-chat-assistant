import { Skeleton } from "@/components/ui/skeleton"

export function ModelStatusSkeleton() {
  return (
    <div className="px-3 py-2 space-y-2">
      {/* Status Header */}
      <Skeleton className="h-4 w-20" />
      
      {/* Database Status */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" /> {/* Icon */}
        <Skeleton className="h-3 w-16" /> {/* Status text */}
      </div>

      {/* LLM Status */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" /> {/* Icon */}
        <Skeleton className="h-3 w-24" /> {/* Model name/status */}
      </div>
    </div>
  )
} 