import React from 'react';

/**
 * Premium TextArea Component
 */
const TextArea = ({ 
  label,
  error,
  className = '',
  disabled = false,
  readOnly = false,
  rows = 4,
  ...props 
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-3
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
          resize-none
          ${disabled ? 'opacity-50 cursor-not-allowed bg-neutral-100' : ''}
          ${readOnly ? 'bg-neutral-50 cursor-default' : ''}
        `}
        disabled={disabled}
        readOnly={readOnly}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default TextArea;

