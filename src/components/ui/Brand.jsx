export default function Brand({ compact = false }) {
  return (
    <span className="brand">
      <svg
        className="brand-mark"
        width="33"
        height="36"
        viewBox="0 0 36 40"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="m18 2 15 8.5v18L18 38 3 29V11L18 2Z"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="m3 11 15 9 15-9M18 20v18M10 7l16 9.5v9L18 30"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
      {!compact && (
        <span className="brand-word">
          inventra<span>®</span>
        </span>
      )}
    </span>
  );
}
