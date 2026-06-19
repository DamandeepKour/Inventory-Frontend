export default function Alert({ type = 'success', message, onClose }) {
  if (!message) return null;

  const styles =
    type === 'success'
      ? 'bg-green-50 text-green-800 border-green-200'
      : 'bg-red-50 text-red-800 border-red-200';

  return (
    <div className={`mb-4 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${styles}`}>
      <span>{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="ml-4 font-medium opacity-70 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}
