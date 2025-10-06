import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, TrendingUp, Clock, Zap, User } from 'lucide-react';

const FilterDropdown = ({ filterType, onFilterChange, authUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filterOptions = [
    { value: 'recent', label: 'Recent', icon: Clock, description: 'Latest posts first' },
    { value: 'trending', label: 'Trending', icon: TrendingUp, description: 'Popular this week' },
    { value: 'hot', label: 'Hot Today', icon: Zap, description: 'Most active today' },
    ...(authUser ? [{ value: 'my-posts', label: 'My Posts', icon: User, description: 'Posts you created' }] : [])
  ];

  const selectedOption = filterOptions.find(option => option.value === filterType);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = (value) => {
    onFilterChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-[#FF6600] focus:ring-2 focus:ring-[#FF6600] focus:border-transparent transition-all duration-200 min-w-[160px]"
      >
        <div className="flex items-center gap-2 flex-1">
          {selectedOption && <selectedOption.icon className="w-4 h-4 text-[#FF6600]" />}
          <span className="font-medium text-gray-900">{selectedOption?.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionSelect(option.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                filterType === option.value ? 'bg-[#FF6600]/5 border-r-2 border-[#FF6600]' : ''
              }`}
            >
              <option.icon className={`w-4 h-4 ${filterType === option.value ? 'text-[#FF6600]' : 'text-gray-400'}`} />
              <div className="flex-1">
                <div className={`font-medium ${filterType === option.value ? 'text-[#FF6600]' : 'text-gray-900'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </div>
              {filterType === option.value && (
                <div className="w-2 h-2 bg-[#FF6600] rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;