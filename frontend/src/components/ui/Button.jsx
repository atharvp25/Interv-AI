import React, { forwardRef, memo, isValidElement } from 'react'
import { Loader2 } from 'lucide-react'

function safeRenderChild(child, defaultSize = 16) {
  if (child === null || child === undefined || typeof child === 'boolean') {
    return null
  }
  if (isValidElement(child)) {
    return child
  }
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

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false,
    icon, iconRight, children, className = '', onClick, disabled, style, ...rest },
  ref
) {
  const sizeCls = size === 'sm' ? 'pn-btn-sm' : size === 'lg' ? 'pn-btn-lg' : ''
  const variantCls = variant === 'secondary' ? 'btn-secondary' : 'btn-primary'

  return (
    <button
      ref={ref}
      className={`${variantCls} ${sizeCls} ${className}`}
      style={style}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="spin" /> : safeRenderChild(icon, 16)}
      <span>{safeRenderChild(children, 16)}</span>
      {!loading && safeRenderChild(iconRight, 16)}
    </button>
  )
})

export default memo(Button)
