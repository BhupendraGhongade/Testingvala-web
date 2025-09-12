import React from 'react';

const TestingValaLogo = ({ iconSize = 36, textSize = 16, className = '' }) => {

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {/* Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 200 200"
        role="img"
        aria-label="TestingVala symbol"
      >
        <circle cx="90" cy="80" r="50" stroke="#0073e6" strokeWidth="8" fill="none" />
        <circle cx="90" cy="80" r="40" stroke="#0073e6" strokeWidth="3" fill="none" />
        <rect x="125" y="115" width="40" height="12" rx="6" ry="6" transform="rotate(45 125 115)" fill="#0073e6" />
        <path d="M65 80 L85 100 L125 50" stroke="#f97316" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {/* Brand Text: 'Testing' blue, 'Vala.com' orange, rendered without space */}
      <div style={{ fontWeight: 500, fontFamily: 'Inter, Arial, sans-serif', fontSize: `${textSize}px`, lineHeight: 1 }}>
        <span style={{ color: '#0073e6', display: 'inline' }}>Testing</span>
        <span style={{ color: '#f97316', display: 'inline' }}>Vala.com</span>
      </div>
    </div>
  );
};

export default TestingValaLogo;
