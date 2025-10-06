import React from 'react';

// Responsive Container Component
export const ResponsiveContainer = ({ 
  children, 
  className = '', 
  maxWidth = '7xl',
  padding = 'responsive' 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
    responsive: 'px-4 sm:px-6 lg:px-8'
  };

  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={`mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Grid Component
export const ResponsiveGrid = ({ 
  children, 
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className = '' 
}) => {
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-10'
  };

  const columnClasses = Object.entries(columns)
    .map(([breakpoint, cols]) => {
      if (breakpoint === 'xs') return `grid-cols-${cols}`;
      return `${breakpoint}:grid-cols-${cols}`;
    })
    .join(' ');

  return (
    <div className={`grid ${columnClasses} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Flex Component
export const ResponsiveFlex = ({ 
  children, 
  direction = { xs: 'col', md: 'row' },
  align = 'center',
  justify = 'between',
  gap = 'md',
  wrap = true,
  className = '' 
}) => {
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-10'
  };

  const directionClasses = Object.entries(direction)
    .map(([breakpoint, dir]) => {
      if (breakpoint === 'xs') return `flex-${dir}`;
      return `${breakpoint}:flex-${dir}`;
    })
    .join(' ');

  return (
    <div className={`flex ${directionClasses} items-${align} justify-${justify} ${gapClasses[gap]} ${wrap ? 'flex-wrap' : ''} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Card Component
export const ResponsiveCard = ({ 
  children, 
  padding = { xs: 'sm', md: 'lg' },
  className = '' 
}) => {
  const paddingClasses = Object.entries(padding)
    .map(([breakpoint, size]) => {
      const sizeMap = { xs: '2', sm: '4', md: '6', lg: '8', xl: '10' };
      if (breakpoint === 'xs') return `p-${sizeMap[size]}`;
      return `${breakpoint}:p-${sizeMap[size]}`;
    })
    .join(' ');

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Typography Component
export const ResponsiveText = ({ 
  children, 
  size = { xs: 'base', md: 'lg' },
  weight = 'normal',
  color = 'gray-900',
  className = '',
  as = 'p' 
}) => {
  const sizeClasses = Object.entries(size)
    .map(([breakpoint, textSize]) => {
      if (breakpoint === 'xs') return `text-${textSize}`;
      return `${breakpoint}:text-${textSize}`;
    })
    .join(' ');

  const Component = as;

  return (
    <Component className={`${sizeClasses} font-${weight} text-${color} ${className}`}>
      {children}
    </Component>
  );
};

// Responsive Image Component
export const ResponsiveImage = ({ 
  src, 
  alt, 
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className = '',
  aspectRatio = 'auto',
  objectFit = 'cover' 
}) => {
  const aspectClasses = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  return (
    <div className={`${aspectClasses[aspectRatio]} overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        className={`w-full h-full object-${objectFit}`}
        loading="lazy"
      />
    </div>
  );
};

// Responsive Navigation Component
export const ResponsiveNav = ({ 
  children, 
  variant = 'horizontal',
  className = '' 
}) => {
  const variantClasses = {
    horizontal: 'flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8',
    vertical: 'flex flex-col gap-2',
    mobile: 'flex flex-col gap-4 md:hidden',
    desktop: 'hidden md:flex md:flex-row md:items-center md:gap-8'
  };

  return (
    <nav className={`${variantClasses[variant]} ${className}`}>
      {children}
    </nav>
  );
};

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveCard,
  ResponsiveText,
  ResponsiveImage,
  ResponsiveNav
};