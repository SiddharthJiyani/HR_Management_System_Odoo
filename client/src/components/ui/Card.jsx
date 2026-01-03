import React from 'react';

/**
 * Premium Glass Card Component
 */
const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick,
  padding = 'md',
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClass = hover 
    ? 'cursor-pointer card-hover hover:border-primary-300' 
    : '';

  return (
    <div
      className={`
        glass-card 
        rounded-card-lg 
        ${paddingClasses[padding]}
        ${hoverClass}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

