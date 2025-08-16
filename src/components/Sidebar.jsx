import React from 'react';

const Sidebar = () => {
  const sidebarSections = [
    {
      title: 'Test Suites',
      items: [
        { id: 'smoke-tests', label: 'Smoke Tests' },
        { id: 'regression-tests', label: 'Regression Tests' },
        { id: 'integration-tests', label: 'Integration Tests' },
        { id: 'e2e-tests', label: 'E2E Tests' }
      ]
    },
    {
      title: 'Categories',
      items: [
        { id: 'functional', label: 'Functional' },
        { id: 'performance', label: 'Performance' },
        { id: 'security', label: 'Security' },
        { id: 'ui-ux', label: 'UI/UX' }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      {sidebarSections.map((section, index) => (
        <div key={index} className="sidebar-section">
          <h3>{section.title}</h3>
          <ul className="sidebar-menu">
            {section.items.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
