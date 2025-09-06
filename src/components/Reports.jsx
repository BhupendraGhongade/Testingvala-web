import React from 'react';
import ReportCard from './ReportCard';

const Reports = () => {
  const reportsData = [
    {
      icon: '📈',
      title: 'Test Execution Summary',
      stats: [
        { label: 'Total Executed', value: '1,247' },
        { label: 'Success Rate', value: '87.3%', type: 'success' },
        { label: 'Avg Duration', value: '2m 15s' }
      ],
      actionLabel: 'Download PDF'
    },
    {
      icon: '🎯',
      title: 'Defect Analysis',
      stats: [
        { label: 'Critical Bugs', value: '12', type: 'critical' },
        { label: 'Major Issues', value: '34', type: 'major' },
        { label: 'Minor Issues', value: '67', type: 'minor' }
      ],
      actionLabel: 'View Details'
    },
    {
      icon: '⚡',
      title: 'Performance Metrics',
      stats: [
        { label: 'Response Time', value: '245ms' },
        { label: 'Throughput', value: '1,200 req/s' },
        { label: 'Error Rate', value: '0.5%', type: 'error' }
      ],
      actionLabel: 'View Details'
    }
  ];

  return (
    <div className="tab-content">
      <div className="content-header">
        <h1>Test Reports & Analytics</h1>
        <div className="date-picker">
          <input type="date" className="date-input" />
          <button className="btn-primary">Generate Report</button>
        </div>
      </div>
      
      <div className="reports-grid">
        {reportsData.map((report, index) => (
          <ReportCard key={index} {...report} />
        ))}
      </div>
    </div>
  );
};

export default Reports;
