import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-start to-bg-end flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}></div>
      
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Auth Card */}
        <div className="bg-white/90 backdrop-blur-auth shadow-soft-lg rounded-card-lg p-8 border border-neutral-200/20">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-soft">
              <span className="text-white font-bold text-xl">HR</span>
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">{title}</h1>
            {subtitle && <p className="text-neutral-500 text-sm">{subtitle}</p>}
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};

const InputField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  placeholder, 
  required = false,
  showPasswordToggle = false,
  disabled = false,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-neutral-700">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl border transition-all duration-200
            placeholder:text-neutral-400 text-neutral-900
            focus:outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400
            disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
            ${error 
              ? 'border-error bg-red-50 focus:ring-error/20 focus:border-error' 
              : 'border-neutral-200 bg-white hover:border-neutral-300'
            }
          `}
        />
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-error animate-fade-in">{error}</p>
      )}
    </div>
  );
};

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'lg',
  className = ''
}) => {
  const baseClasses = 'font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary-400 hover:bg-primary-500 text-white focus:ring-primary-400/20 shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 focus:ring-neutral-400/20',
    ghost: 'hover:bg-neutral-100 text-neutral-600 focus:ring-neutral-400/20'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      )}
      {children}
    </button>
  );
};

const SelectField = ({ 
  label, 
  value, 
  onChange, 
  options, 
  error, 
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-neutral-700">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-xl border transition-all duration-200
          text-neutral-900 bg-white
          focus:outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400
          disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
          ${error 
            ? 'border-error bg-red-50 focus:ring-error/20 focus:border-error' 
            : 'border-neutral-200 hover:border-neutral-300'
          }
        `}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-error animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export { AuthLayout, InputField, Button, SelectField };