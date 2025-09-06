import React from 'react';

const Settings = () => {
  return (
    <div className="tab-content">
      <div className="content-header">
        <h1>Settings & Configuration</h1>
      </div>
      
      <div className="settings-container">
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="setting-item">
            <label>Company Name</label>
            <input type="text" defaultValue="Testingvala" className="setting-input" />
          </div>
          <div className="setting-item">
            <label>Default Test Environment</label>
            <select className="setting-select">
              <option>Development</option>
              <option>Staging</option>
              <option>Production</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Email Notifications</label>
            <div className="toggle-switch">
              <input type="checkbox" id="email-toggle" defaultChecked />
              <label htmlFor="email-toggle"></label>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>User Management</h3>
          <div className="user-list">
            <div className="user-item">
              <div className="user-info">
                <div className="user-avatar">👨‍💻</div>
                <div>
                  <h4>John Doe</h4>
                  <span>Administrator</span>
                </div>
              </div>
              <button className="btn-small">Edit</button>
            </div>
            <div className="user-item">
              <div className="user-info">
                <div className="user-avatar">👩‍💻</div>
                <div>
                  <h4>Sarah Smith</h4>
                  <span>QA Engineer</span>
                </div>
              </div>
              <button className="btn-small">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
