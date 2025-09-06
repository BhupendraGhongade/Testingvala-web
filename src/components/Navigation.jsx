import React from 'react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'test-cases', label: 'Test Cases' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' },
    { id: 'help', label: 'Help' }
  ];

  return (
    <nav className="nav">
      {navItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setActiveTab(item.id);
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
};

export default Navigation;
