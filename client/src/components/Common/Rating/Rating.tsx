import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatReviewCount } from '@/utils/format'

interface Props {
  rating: number
  reviewCount?: number
  size?: 'sm' | 'md'
  showCount?: boolean
  className?: string
}

const Rating: React.FC<Props> = ({
  rating,
  reviewCount,
  size = 'sm',
  showCount = true,
  className,
}) => {
  const starSize = size === 'sm' ? 12 : 16

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating)
          const partial = !filled && i < rating
          return (
            <span
              key={i}
              className="relative inline-block"
              style={{ width: starSize, height: starSize }}
            >
              <Star size={starSize} className="text-argos-gray-light" fill="currentColor" />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? '100%' : `${(rating % 1) * 100}%` }}
                >
                  <Star size={starSize} className="text-argos-amber" fill="currentColor" />
                </span>
              )}
            </span>
          )
        })}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-argos-blue hover:underline cursor-pointer">
          ({formatReviewCount(reviewCount)})
        </span>
      )}
    </div>
  )
}

export default Rating
