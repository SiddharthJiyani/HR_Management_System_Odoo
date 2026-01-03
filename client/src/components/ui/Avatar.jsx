import React from 'react';

/**
 * Avatar Component with Status Indicator
 */
const Avatar = ({ 
  src, 
  alt = 'User Avatar', 
  name = '',
  size = 'md',
  status,
  showStatus = false,
  className = '',
  onClick,
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
  };

  const statusSizeClasses = {
    xs: 'w-2 h-2 border',
    sm: 'w-2.5 h-2.5 border-2',
    md: 'w-3 h-3 border-2',
    lg: 'w-4 h-4 border-2',
    xl: 'w-5 h-5 border-2',
  };

  const statusColors = {
    present: 'bg-success',
    absent: 'bg-warning',
    leave: 'bg-info',
    'not-checked-in': 'bg-error',
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div 
      className={`relative inline-flex ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-soft`}
        />
      ) : (
        <div 
          className={`
            ${sizeClasses[size]} 
            rounded-full 
            bg-gradient-to-br from-primary-300 to-primary-500 
            flex items-center justify-center 
            font-semibold text-neutral-800
            ring-2 ring-white shadow-soft
          `}
        >
          {getInitials(name)}
        </div>
      )}
      
      {showStatus && status && (
        <span 
          className={`
            absolute bottom-0 right-0 
            ${statusSizeClasses[size]} 
            ${statusColors[status]} 
            rounded-full 
            border-white
          `}
          title={status}
        />
      )}
    </div>
  );
};

export default Avatar;

