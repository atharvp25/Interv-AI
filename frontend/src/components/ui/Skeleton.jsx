import React, { memo } from 'react'

function Skeleton({ w = '100%', h = 16, r = 12, style, className = '' }) {
  return <div className={`pn-skeleton ${className}`} aria-hidden="true" style={{ width: w, height: h, borderRadius: r, ...style }} />
}

export const SkeletonCard = memo(function SkeletonCard({ lines = 3 }) {
  return (
    <div className="pn-card" style={{ padding: 24, display: 'grid', gap: 12 }} role="status" aria-label="Loading">
      <Skeleton w="40%" h={18} />
      {Array.from({ length: lines }).map((_, i) => <Skeleton key={i} w={`${90 - i * 12}%`} h={12} />)}
    </div>
  )
})

export default memo(Skeleton)

