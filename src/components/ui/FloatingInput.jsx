import FieldError from './FieldError';

export default function FloatingInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder = ' ',
  required,
  min,
  max,
  step,
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
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
          className={`peer w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 ${borderClass}`}
        />
        <label
          htmlFor={id}
          className={`pointer-events-none absolute -top-2.5 left-4 bg-white px-1 text-xs font-semibold ${error ? 'text-red-600' : 'text-gray-900'}`}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
