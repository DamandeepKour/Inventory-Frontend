import Button from './Button';

export default function PageStateMessage({
  variant = 'empty',
  title,
  message,
  actionLabel,
  onAction,
}) {
  const isError = variant === 'error';

  return (
    <div
      className={`rounded-xl border bg-white px-6 py-12 text-center shadow-sm ${
        isError ? 'border-red-200' : 'border-dashed border-gray-300'
      }`}
    >
      <p className="text-base font-semibold text-gray-900">{title}</p>
      <p className={`mt-2 text-sm ${isError ? 'font-medium text-red-600' : 'text-gray-900'}`}>
        {message}
      </p>
      {onAction && actionLabel && (
        <Button type="button" onClick={onAction} className="mt-5" variant={isError ? 'secondary' : 'primary'}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
