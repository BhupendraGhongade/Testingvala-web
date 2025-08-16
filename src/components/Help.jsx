import React from 'react';

const Help = () => {
  const helpItems = [
    {
      icon: '🚀',
      title: 'Getting Started',
      description: 'Learn the basics of using Testingvala dashboard',
      link: 'Read Guide →'
    },
    {
      icon: '📝',
      title: 'Creating Test Cases',
      description: 'Step-by-step guide to create your first test case',
      link: 'Read Guide →'
    },
    {
      icon: '📊',
      title: 'Understanding Reports',
      description: 'How to interpret test results and analytics',
      link: 'Read Guide →'
    }
  ];

  const contactInfo = [
    { icon: '📧', text: 'support@testingvala.com' },
    { icon: '📞', text: '+1 (555) 123-4567' },
    { icon: '💬', text: 'Live Chat Available' }
  ];

  return (
    <div className="tab-content">
      <div className="content-header">
        <h1>Help & Support</h1>
      </div>
      
      <div className="help-container">
        <div className="help-section">
          <h3>Quick Start Guide</h3>
          {helpItems.map((item, index) => (
            <div key={index} className="help-item">
              <div className="help-icon">{item.icon}</div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <a href="#" className="help-link">{item.link}</a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="help-section">
          <h3>Contact Support</h3>
          <div className="contact-info">
            {contactInfo.map((contact, index) => (
              <div key={index} className="contact-item">
                <span className="contact-icon">{contact.icon}</span>
                <span>{contact.text}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary">Open Support Ticket</button>
        </div>
      </div>
    </div>
  );
};

export default Help;
