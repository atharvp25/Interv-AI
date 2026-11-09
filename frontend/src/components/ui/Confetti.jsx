import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#7C5CFF', '#22D3B6', '#FF9F43', '#34D399', '#F472B6', '#60A5FA']

function Confetti({ count = 42 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${(i * 97) % 100}%`,
        color: COLORS[i % COLORS.length],
        delay: (i % 10) * 0.08,
        duration: 2.2 + (i % 5) * 0.35,
        rotate: (i % 2 === 0 ? 1 : -1) * (180 + (i * 35) % 360),
        size: 6 + (i % 4) * 2,
      })),
    [count]
  )

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10001 }} aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: '105vh', x: (p.id % 2 === 0 ? 1 : -1) * 60, opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: p.left,
            width: p.size,
            height: p.size * 1.6,
            borderRadius: 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  )
}

export default memo(Confetti)

