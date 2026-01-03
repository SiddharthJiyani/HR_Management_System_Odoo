import React from 'react';

/**
 * Premium Tabs Component
 */
const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`inline-flex gap-1 p-1.5 bg-neutral-100/80 backdrop-blur-sm rounded-2xl border border-neutral-200/50 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          disabled={tab.disabled}
          className={`
            relative px-5 py-2.5 rounded-xl font-medium text-sm
            transition-all duration-300 ease-out
            ${activeTab === tab.id
              ? 'bg-white text-neutral-900 shadow-soft'
              : 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50'
            }
            ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {/* Active indicator glow */}
          {activeTab === tab.id && (
            <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-400/5 to-transparent pointer-events-none" />
          )}
          
          <span className="relative flex items-center gap-2">
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
