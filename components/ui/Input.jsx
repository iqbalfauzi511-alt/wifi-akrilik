import React from 'react';

export default function Input({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  prefix,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-medium sm:text-sm">
            {prefix}
          </div>
        )}
        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`block w-full rounded-xl border sm:text-sm transition-colors py-2.5 px-3.5 ${
            prefix ? 'pl-9' : ''
          } ${
            error
              ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500'
              : 'border-slate-200 text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
          } ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-white'} ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
