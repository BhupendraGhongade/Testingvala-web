import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Tag } from 'lucide-react';

const CategoryDropdown = ({ categories, selectedCategory, onCategoryChange }) => {
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

  const selectedCategoryName = selectedCategory === 'all' 
    ? 'All Categories' 
    : categories.find(cat => cat.id === selectedCategory)?.name || 'Select Category';



  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-[#FF6600] focus:ring-2 focus:ring-[#FF6600] focus:border-transparent transition-all duration-200 min-w-[200px]"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700 font-medium truncate">{selectedCategoryName}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
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
            <button
              onClick={() => {
                onCategoryChange('all');
                setIsOpen(false);
                setSearchTerm('');
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                selectedCategory === 'all' ? 'bg-[#FF6600] text-white hover:bg-[#E55A00]' : 'text-gray-700'
              }`}
            >
              <span className="font-medium">All Categories</span>
            </button>
            
            {filteredCategories.map((category) => {
              const isSelected = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    onCategoryChange(category.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-[#FF6600] text-white hover:bg-[#E55A00]' : 'text-gray-700'
                  }`}
                >
                  <span className="font-medium truncate">{category.name}</span>
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

export default CategoryDropdown;