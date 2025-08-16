import React from 'react';
import TestCaseCard from './TestCaseCard';

const TestCases = () => {
  const testCasesData = [
    {
      priority: 'High',
      status: 'Active',
      title: 'User Authentication Flow',
      description: 'Test the complete user login, registration, and password reset functionality',
      category: 'Functional',
      assignee: '👨‍💻 John Doe',
      actions: [
        { type: 'secondary', label: 'Edit' },
        { type: 'primary', label: 'Run Test' }
      ]
    },
    {
      priority: 'Medium',
      status: 'Draft',
      title: 'Payment Gateway Integration',
      description: 'Verify payment processing, transaction validation, and error handling',
      category: 'Integration',
      assignee: '👩‍💻 Sarah Smith',
      actions: [
        { type: 'secondary', label: 'Edit' },
        { type: 'primary', label: 'Run Test' }
      ]
    },
    {
      priority: 'Low',
      status: 'Completed',
      title: 'Email Template Rendering',
      description: 'Test email template generation and formatting across different email clients',
      category: 'UI/UX',
      assignee: '👨‍💻 Mike Johnson',
      actions: [
        { type: 'secondary', label: 'View' },
        { type: 'success', label: '✓ Passed' }
      ]
    }
  ];

  return (
    <div className="tab-content">
      <div className="content-header">
        <h1>Test Cases Management</h1>
        <button className="btn-primary">+ Create New Test Case</button>
      </div>
      
      <div className="test-cases-grid">
        {testCasesData.map((testCase, index) => (
          <TestCaseCard key={index} {...testCase} />
        ))}
      </div>
    </div>
  );
};

export default TestCases;
