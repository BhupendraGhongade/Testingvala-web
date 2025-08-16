import React from 'react';

const TestCaseCard = ({ priority, status, title, description, category, assignee, actions }) => {
  return (
    <div className="test-case-card">
      <div className="card-header">
        <span className={`priority ${priority.toLowerCase()}`}>{priority}</span>
        <span className={`status ${status.toLowerCase()}`}>{status}</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="card-meta">
        <span className="category">{category}</span>
        <span className="assignee">{assignee}</span>
      </div>
      <div className="card-actions">
        {actions.map((action, index) => (
          <button key={index} className={`btn-${action.type}`}>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TestCaseCard;
