import React from 'react';

const SearchIcon = () => (
  <svg 
    className="w-5 h-5 text-neutral-400" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
    />
  </svg>
);

const SearchBar = ({ 
  value = '', 
  onChange, 
  placeholder = 'Search employees...', 
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          pl-12 pr-4 py-2.5
          bg-white/60
          backdrop-blur-sm
          border border-neutral-200
          rounded-xl
          text-neutral-800
          placeholder-neutral-400
          focus:outline-none
          focus:border-primary-400
          focus:ring-2
          focus:ring-primary-400/20
          transition-all
          duration-200
        "
      />
    </div>
  );
};

export default SearchBar;

