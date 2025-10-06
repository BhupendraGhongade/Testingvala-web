import React from 'react';

const ProfessionalAvatar = ({ 
  name, 
  size = 'md', 
  isOnline = false, 
  experience = null,
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradientFromName = (name) => {
    if (!name) return 'from-gray-400 to-gray-600';
    
    const gradients = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600', 
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-red-400 to-red-600',
      'from-yellow-400 to-yellow-600',
      'from-teal-400 to-teal-600',
      'from-orange-400 to-orange-600',
      'from-cyan-400 to-cyan-600'
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const getExperienceBadge = (experience) => {
    const badges = {
      '0-1': { color: 'bg-green-500', label: 'Fresher' },
      '1-3': { color: 'bg-blue-500', label: 'Junior' },
      '3-5': { color: 'bg-purple-500', label: 'Mid' },
      '5-8': { color: 'bg-orange-500', label: 'Senior' },
      '8-12': { color: 'bg-red-500', label: 'Lead' },
      '12+': { color: 'bg-yellow-500', label: 'Expert' }
    };
    return badges[experience] || null;
  };

  const initials = getInitials(name);
  const gradient = getGradientFromName(name);
  const experienceBadge = experience ? getExperienceBadge(experience) : null;

  return (
    <div className={`relative ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        bg-gradient-to-br ${gradient} 
        rounded-full 
        flex items-center justify-center 
        text-white font-semibold 
        shadow-lg 
        ring-2 ring-white
        transition-all duration-200 
        hover:scale-110 hover:shadow-xl
      `}>
        {initials}
      </div>
      
      {/* Online Status Indicator */}
      {isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
      )}
      
      {/* Experience Badge */}
      {experienceBadge && size !== 'xs' && size !== 'sm' && (
        <div className={`
          absolute -top-1 -right-1 
          ${experienceBadge.color} 
          text-white text-xs font-bold 
          px-1.5 py-0.5 rounded-full 
          shadow-lg border border-white
          transform scale-75
        `}>
          {experienceBadge.label}
        </div>
      )}
    </div>
  );
};

export default ProfessionalAvatar;