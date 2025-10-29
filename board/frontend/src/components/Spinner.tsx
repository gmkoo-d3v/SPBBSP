import React from 'react'

const Spinner: React.FC<{ small?: boolean; text?: string }>
  = ({ small = false, text }) => (
  <div className="d-flex align-items-center gap-2">
    <div className={`spinner-border${small ? ' spinner-border-sm' : ''}`} role="status" aria-hidden="true" />
    {text ? <span>{text}</span> : null}
  </div>
)

export default Spinner

