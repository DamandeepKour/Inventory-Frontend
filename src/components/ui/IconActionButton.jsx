export function IconActionButton({ label, onClick, children, variant = 'default' }) {
  const variants = {
    default: 'text-gray-600 hover:bg-gray-200 hover:text-gray-900',
    danger: 'text-gray-600 hover:bg-red-50 hover:text-red-600',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded-lg p-2 transition ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
