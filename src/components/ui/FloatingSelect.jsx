import FieldError from './FieldError';

export default function FloatingSelect({
  label,
  id,
  value,
  onChange,
  onBlur,
  children,
  required,
  error,
  disabled,
}) {
  const errorId = error ? `${id}-error` : undefined;
  const borderClass = error
    ? 'border-red-400 focus:border-red-500'
    : 'border-gray-300 focus:border-gray-900';

  return (
    <div className="w-full">
      <div className="relative w-full">
        <select
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
          className={`w-full appearance-none rounded-xl border bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${borderClass}`}
        >
          {children}
        </select>
        <label
          htmlFor={id}
          className={`pointer-events-none absolute -top-2.5 left-4 bg-white px-1 text-xs font-semibold ${error ? 'text-red-600' : 'text-gray-900'}`}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          ▾
        </span>
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
