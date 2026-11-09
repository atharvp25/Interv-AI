import React, { memo, useEffect, useState } from 'react'

function CountUp({ value = 0, duration = 900, decimals = 0, suffix = '' }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const target = Number(value) || 0
    let start = null
    let rafId
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min(1, (ts - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(target * eased)
      if (p < 1) rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [value, duration])

  return (
    <span>
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
      {suffix}
    </span>
  )
}

export default memo(CountUp)

