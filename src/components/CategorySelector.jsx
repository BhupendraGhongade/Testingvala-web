import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Tag, Check } from 'lucide-react';

const CategorySelector = ({ categories, selectedCategory, onCategoryChange, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCategoryName = selectedCategory 
    ? categories.find(cat => cat.id === selectedCategory)?.name || 'Select a category'
    : 'Select a category';

  const getCategoryIcon = (category) => {
    const name = category.name.toLowerCase();
    if (name.includes('automation') || name.includes('auto')) return '⚡';
    if (name.includes('manual')) return '📋';
    if (name.includes('api')) return '🔌';
    if (name.includes('performance') || name.includes('load')) return '📊';
    if (name.includes('security')) return '🔒';
    if (name.includes('mobile')) return '📱';
    if (name.includes('interview') || name.includes('career')) return '💼';
    if (name.includes('certification') || name.includes('course')) return '🎓';
    if (name.includes('beginner') || name.includes('fresher')) return '🌱';
    if (name.includes('tool') || name.includes('management')) return '🛠️';
    if (name.includes('devops') || name.includes('ci/cd')) return '🚀';
    if (name.includes('bug') || name.includes('tracking')) return '🐛';
    if (name.includes('ai') || name.includes('artificial')) return '🤖';
    if (name.includes('job') || name.includes('opening')) return '💼';
    if (name.includes('contest') || name.includes('challenge')) return '🏆';
    if (name.includes('practice') || name.includes('process')) return '✅';
    if (name.includes('help') || name.includes('support')) return '❓';
    if (name.includes('event') || name.includes('meetup')) return '📅';
    return '💬';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-3 bg-white border rounded-lg transition-all duration-200 ${
          selectedCategory 
            ? 'border-[#FF6600] ring-2 ring-[#FF6600]/20' 
            : 'border-gray-300 hover:border-[#FF6600] focus:ring-2 focus:ring-[#FF6600] focus:border-transparent'
        }`}
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-500" />
          <span className={`truncate ${selectedCategory ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            {selectedCategoryName}
          </span>
          {required && !selectedCategory && <span className="text-red-500">*</span>}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredCategories.map((category) => {
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    onCategoryChange(category.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                    isSelected ? 'bg-[#FF6600] text-white hover:bg-[#E55A00]' : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <span className="font-medium truncate flex-1">{category.name}</span>
                  {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              );
            })}
            
            {filteredCategories.length === 0 && searchTerm && (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                No categories found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;