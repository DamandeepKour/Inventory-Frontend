export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 py-8 text-sm text-gray-500">
      <span
        className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
