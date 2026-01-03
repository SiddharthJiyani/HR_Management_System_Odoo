import React from 'react';

/**
 * Premium Input Component
 */
const Input = ({ 
  label,
  error,
  icon,
  className = '',
  disabled = false,
  readOnly = false,
  ...props 
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-neutral-400">{icon}</span>
          </div>
        )}
        <input
          className={`
            w-full
            ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3
            bg-white/80
            backdrop-blur-sm
            border
            ${error ? 'border-error' : 'border-neutral-200'}
            rounded-xl
            text-neutral-800
            placeholder-neutral-400
            focus:outline-none
            focus:border-primary-400
            focus:ring-2
            focus:ring-primary-400/20
            transition-all
            duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed bg-neutral-100' : ''}
            ${readOnly ? 'bg-neutral-50 cursor-default' : ''}
          `}
          disabled={disabled}
          readOnly={readOnly}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default Input;

