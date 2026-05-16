import React from 'react'
import { cn } from '@/utils/cn'

interface Props {
  className?: string
  rounded?: boolean
}

const Skeleton: React.FC<Props> = ({ className, rounded }) => (
  <div
    className={cn('animate-pulse bg-argos-border', rounded ? 'rounded-full' : 'rounded', className)}
  />
)

export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white border border-argos-border rounded p-3">
    <Skeleton className="w-full aspect-square mb-3" />
    <Skeleton className="h-3 w-3/4 mb-2" />
    <Skeleton className="h-3 w-1/2 mb-3" />
    <Skeleton className="h-4 w-1/3 mb-3" />
    <Skeleton className="h-9 w-full" />
  </div>
)

export default Skeleton
