export default function StarRating({ value = 0, count, size = "1rem", interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="star-rating" style={{ fontSize: size }}>
      {stars.map((s) => (
        <i
          key={s}
          className={`fa-star ${s <= Math.round(value) ? "fas" : "far"}`}
          style={{ cursor: interactive ? "pointer" : "default" }}
          onClick={() => interactive && onChange && onChange(s)}
        />
      ))}
      {typeof count === "number" && <span className="star-count">({count})</span>}
    </span>
  );
}
