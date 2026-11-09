import React, { memo, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

function Card({ children, tilt = false, hover = true, className = '', style, padding = 24, as = 'div', ...rest }) {
  const ref = useRef(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(mx, [0, 1], [-5, 5]), { stiffness: 200, damping: 20 })

  const onMove = (e) => {
    if (!tilt || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => { mx.set(0.5); my.set(0.5) }
  const Comp = motion[as] || motion.div

  return (
    <Comp
      ref={ref}
      className={`pn-card ${hover ? 'pn-card-hover' : ''} ${className}`}
      style={{ padding, rotateX: tilt ? rx : 0, rotateY: tilt ? ry : 0, transformPerspective: 900, ...style }}
      whileHover={hover ? { y: -4 } : undefined}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </Comp>
  )
}

export default memo(Card)

