export function Loader() {
  return (
    <div className="loader">
      <div className="spinner" />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="empty">
      {Icon && <Icon className="empty-icon" size={56} strokeWidth={1.5} />}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
    </div>
  )
}
