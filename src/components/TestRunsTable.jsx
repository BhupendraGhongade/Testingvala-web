import React from 'react';

const TestRunsTable = () => {
  const testRunsData = [
    {
      category: 'Functional',
      title: 'User Login Validation',
      status: 'passed',
      duration: '2m 34s',
      date: '2025-01-14 14:30'
    },
    {
      category: 'Performance',
      title: 'API Response Time',
      status: 'failed',
      duration: '1m 45s',
      date: '2025-01-14 14:25'
    },
    {
      category: 'Security',
      title: 'SQL Injection Test',
      status: 'passed',
      duration: '3m 12s',
      date: '2025-01-14 14:20'
    },
    {
      category: 'UI/UX',
      title: 'Button Hover Effects',
      status: 'in-progress',
      duration: '1m 58s',
      date: '2025-01-14 14:15'
    },
    {
      category: 'Functional',
      title: 'Form Validation',
      status: 'pending',
      duration: '--',
      date: '2025-01-14 14:10'
    }
  ];

  return (
    <section className="test-runs">
      <div className="section-header">
        <h2>Recent Test Runs</h2>
        <div className="table-controls">
          <div className="search-box">
            <input type="text" placeholder="Search test runs..." />
            <span className="search-icon">🔍</span>
          </div>
          <div className="filters">
            <select className="filter-select">
              <option value="">All Status</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
            </select>
            <select className="filter-select">
              <option value="">All Categories</option>
              <option value="functional">Functional</option>
              <option value="performance">Performance</option>
              <option value="security">Security</option>
              <option value="ui-ux">UI/UX</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="table-container">
        <table className="test-runs-table">
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testRunsData.map((run, index) => (
              <tr key={index}>
                <td>
                  <div className="test-name">
                    <span className="test-category">{run.category}</span>
                    <span className="test-title">{run.title}</span>
                  </div>
                </td>
                <td><span className={`status-badge ${run.status}`}>{run.status}</span></td>
                <td>{run.duration}</td>
                <td>{run.date}</td>
                <td>
                  <button className="action-btn">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TestRunsTable;
