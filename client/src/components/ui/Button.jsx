import React from 'react';

/**
 * Premium Button Component
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  icon,
  iconPosition = 'left',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-gradient-to-br from-primary-400 to-primary-600 text-neutral-900 hover:shadow-lg hover:shadow-primary-400/30 hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-neutral-800 text-white hover:bg-neutral-700 hover:-translate-y-0.5 active:translate-y-0',
    outline: 'border-2 border-neutral-300 text-neutral-700 hover:border-primary-400 hover:text-primary-600 bg-white/50',
    ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-7 py-3 text-lg gap-2.5',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
};

export default Button;

