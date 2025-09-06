import React from 'react';
import MetricCard from './MetricCard';

const Metrics = () => {
  const metricsData = [
    {
      icon: '📊',
      title: 'Total Test Cases',
      value: '1,247',
      change: { text: '+12% from last week', type: 'positive' },
      type: 'total'
    },
    {
      icon: '✅',
      title: 'Passed',
      value: '1,089',
      change: { text: '+8% from last week', type: 'positive' },
      type: 'passed'
    },
    {
      icon: '❌',
      title: 'Failed',
      value: '89',
      change: { text: '+3% from last week', type: 'negative' },
      type: 'failed'
    },
    {
      icon: '⏳',
      title: 'Pending',
      value: '42',
      change: { text: 'No change', type: 'neutral' },
      type: 'pending'
    },
    {
      icon: '🔄',
      title: 'In Progress',
      value: '27',
      change: { text: '+5% from last week', type: 'positive' },
      type: 'in-progress'
    }
  ];

  return (
    <section className="metrics">
      <h2>Dashboard Overview</h2>
      <div className="metrics-grid">
        {metricsData.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </section>
  );
};

export default Metrics;
