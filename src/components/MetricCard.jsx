import React from 'react';

const MetricCard = ({ icon, title, value, change, type = 'total' }) => {
  return (
    <div className={`metric-card ${type}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <h3>{title}</h3>
        <div className="metric-value">{value}</div>
        <div className={`metric-change ${change.type || 'neutral'}`}>
          {change.text}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
