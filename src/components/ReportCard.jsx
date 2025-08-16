import React from 'react';

const ReportCard = ({ icon, title, stats, actionLabel, actionType = 'outline' }) => {
  return (
    <div className="report-card">
      <div className="report-icon">{icon}</div>
      <h3>{title}</h3>
      <div className="report-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <span className="stat-label">{stat.label}</span>
            <span className={`stat-value ${stat.type || ''}`}>{stat.value}</span>
          </div>
        ))}
      </div>
      <button className={`btn-${actionType}`}>{actionLabel}</button>
    </div>
  );
};

export default ReportCard;
