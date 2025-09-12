import React from 'react';

// Single clean Logo component. Uses inline SVG in user colors and supports size/className props.
const Logo = ({ size = 'default', className = '', showWordmark = true }) => {
  const sizeMap = { small: 24, default: 40, large: 64 };
  const px = typeof size === 'number' ? size : (sizeMap[size] || sizeMap.default);

  const wordmarkSize = Math.max(12, Math.round(px * 0.5));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={px}
        height={px}
        viewBox="0 0 200 200"
        role="img"
        aria-label="TestingVala logo"
        className="flex-shrink-0"
      >
        <circle cx="90" cy="80" r="50" stroke="#0073e6" strokeWidth="8" fill="#ffffff" />
        <circle cx="90" cy="80" r="40" stroke="#0073e6" strokeWidth="3" fill="#ffffff" />
        <rect x="125" y="115" width="40" height="12" rx="6" ry="6" transform="rotate(45 125 115)" fill="#0073e6" />
        <path d="M65 80 L85 100 L125 50" stroke="#f97316" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <div style={{ fontWeight: 700, fontSize: wordmarkSize, lineHeight: 1 }}>
            <span style={{ color: '#0073e6' }}>Testing</span>
            <span style={{ color: '#f97316', marginLeft: 6 }}>Vala</span>
            <span style={{ color: '#f97316', marginLeft: 6, fontSize: Math.round(wordmarkSize * 0.6) }}>.com</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
