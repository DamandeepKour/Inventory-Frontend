export function IconActionButton({ label, onClick, children, variant = 'default' }) {
  const variants = {
    default: 'text-gray-600 hover:bg-gray-200 hover:text-gray-900',
    view: 'text-blue-600 hover:bg-blue-50 hover:text-blue-700',
    edit: 'text-green-600 hover:bg-green-50 hover:text-green-700',
    danger: 'text-red-600 hover:bg-red-50 hover:text-red-700',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded-lg p-2 transition ${variants[variant] || variants.default}`}
    >
      {children}
    </button>
  );
}
