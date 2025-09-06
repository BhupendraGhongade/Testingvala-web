import React, { useState } from 'react';

const ContestForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    socialMedia: '',
    hackTitle: '',
    description: '',
    tools: '',
    impact: '',
    consent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 5000);
  };

  const isFormValid = formData.fullName && formData.email && formData.hackTitle && 
                     formData.description && formData.impact && formData.consent;

  if (isSubmitted) {
    return (
      <div className="form-overlay">
        <div className="form-container success">
          <div className="success-icon">🎉</div>
          <h2>Thank you for participating!</h2>
          <p>Your idea has been successfully submitted. Winners will be announced on February 1st, 2025. Stay tuned!</p>
          <div className="success-actions">
            <button className="success-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-overlay">
      <div className="form-container">
        <div className="form-header">
          <button className="close-btn" onClick={onClose}>×</button>
          <h2>💡 Testing Hacks Contest – Share Your Smart Techniques!</h2>
          <p>Show off your QA skills! Share your tips, tricks, or hacks to make the testing process faster, smarter, or more efficient. The best entries will get featured and win exciting prizes!</p>
        </div>

        <form onSubmit={handleSubmit} className="contest-form">
          {/* Participant Information */}
          <div className="form-section">
            <h3>👤 Participant Information</h3>
            
            <div className="form-group">
              <label htmlFor="fullName">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
              />
              <small>Required for prize notification</small>
            </div>

            <div className="form-group">
              <label htmlFor="socialMedia">
                Social Media Handle / LinkedIn
              </label>
              <input
                type="text"
                id="socialMedia"
                name="socialMedia"
                value={formData.socialMedia}
                onChange={handleInputChange}
                placeholder="@username or LinkedIn profile (optional)"
              />
            </div>
          </div>

          {/* Contest Entry Questions */}
          <div className="form-section">
            <h3>🏆 Contest Entry</h3>
            
            <div className="form-group">
              <label htmlFor="hackTitle">
                Title of Your Hack / Technique <span className="required">*</span>
              </label>
              <input
                type="text"
                id="hackTitle"
                name="hackTitle"
                value={formData.hackTitle}
                onChange={handleInputChange}
                placeholder="e.g., Automating Regression Checks with a Single Script"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description of the Hack / Trick <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Explain your technique in detail. Example: I created a script to automatically run regression tests across multiple environments, saving 3 hours of manual work daily."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tools">
                Tools or Resources Used
              </label>
              <input
                type="text"
                id="tools"
                name="tools"
                value={formData.tools}
                onChange={handleInputChange}
                placeholder="e.g., Selenium, Postman, Excel, Jira"
              />
            </div>

            <div className="form-group">
              <label htmlFor="impact">
                Impact / Benefit of the Technique <span className="required">*</span>
              </label>
              <textarea
                id="impact"
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                placeholder="Describe the benefits. Example: Reduces manual testing time by 50%, ensures faster bug detection, improves team efficiency."
                rows="4"
                required
              />
            </div>
          </div>

          {/* Consent & Rules */}
          <div className="form-section">
            <h3>📋 Consent & Rules</h3>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleInputChange}
                  required
                />
                <span className="checkmark"></span>
                I confirm that my submission is original, and I agree to contest rules and the use of my idea for feature purposes. <span className="required">*</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : '🚀 Submit My Entry'}
            </button>
            
            {!isFormValid && (
              <p className="form-note">
                Please fill in all required fields marked with *
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContestForm;
