import React, { memo, isValidElement } from 'react'

function safeRenderChild(child, defaultSize = 13) {
  if (child === null || child === undefined || typeof child === 'boolean') {
    return null
  }
  if (isValidElement(child)) {
    return child
  }
  // If it's a React component / forwardRef (e.g. Lucide icon object { $$typeof, render })
  if (typeof child === 'function' || (typeof child === 'object' && child !== null && ('render' in child || '$$typeof' in child))) {
    const Component = child
    return <Component size={defaultSize} />
  }
  if (Array.isArray(child)) {
    return child.map((sub, idx) => (
      <React.Fragment key={idx}>{safeRenderChild(sub, defaultSize)}</React.Fragment>
    ))
  }
  if (typeof child === 'string' || typeof child === 'number') {
    return child
  }
  return null
}

function Badge({ tone = 'primary', dot = false, pulse = false, icon, children, className = '', style, ...rest }) {
  return (
    <span className={`pn-badge pn-badge-${tone} ${className}`} style={style} {...rest}>
      {(dot || pulse) && <span className="pn-dot" aria-hidden="true" />}
      {icon && safeRenderChild(icon, 13)}
      {safeRenderChild(children, 13)}
    </span>
  )
}

export default memo(Badge)
