export default function Loader({ label = "Loading..." }) {
  return (
    <div className="loader-wrap">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ icon = "fa-box-open", title, message, action }) {
  return (
    <div className="empty-state">
      <i className={`fas ${icon}`} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
