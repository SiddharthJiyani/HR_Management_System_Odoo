import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({ 
  trigger, 
  children, 
  align = 'right',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div 
          className={`
            absolute top-full mt-2 
            ${alignClasses[align]}
            min-w-[180px]
            bg-white
            rounded-xl
            shadow-soft-lg
            border border-neutral-100
            overflow-hidden
            dropdown-enter
            z-50
          `}
        >
          <div onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ 
  children, 
  icon, 
  onClick, 
  danger = false,
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full
        flex items-center gap-3
        px-4 py-3
        text-left
        transition-colors
        duration-150
        ${danger 
          ? 'text-error hover:bg-error/10' 
          : 'text-neutral-700 hover:bg-neutral-50'
        }
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0 w-5 h-5">{icon}</span>}
      <span className="font-medium">{children}</span>
    </button>
  );
};

export { Dropdown, DropdownItem };

