'use client';

import { useState, useEffect, useRef } from 'react';

export default function CustomSelect({
  options = [],
  value = '',
  onChange,
  disabled = false,
  bgColorClass = 'bg-white',
  placeholder = 'Select an option',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (val) => {
    if (disabled) return;
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full text-left" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100/60 dark:focus:ring-cyan-950/40 disabled:opacity-50 disabled:cursor-not-allowed ${bgColorClass}`}
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          className={`h-4 w-4 text-slate-500 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 focus:outline-none animate-in fade-in slide-in-from-top-3 duration-200">
          <ul role="listbox" aria-activedescendant={value} className="space-y-0.5">
            {options.map((option) => {
              const isSelected = String(option.value) === String(value);
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-2.5 text-sm transition duration-150 ${
                    isSelected
                      ? 'bg-cyan-50/50 text-cyan-600 font-semibold'
                      : 'text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <svg className="h-4 w-4 text-cyan-600 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
