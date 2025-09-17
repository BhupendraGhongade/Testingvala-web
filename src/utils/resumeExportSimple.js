// Simplified Resume Export without external dependencies
// This version works with existing dependencies only

export const resumeTemplates = {
  modern: {
    name: 'Modern Professional',
    colors: {
      primary: '#1a365d',
      secondary: '#2c5282',
      accent: '#3182ce'
    }
  },
  executive: {
    name: 'Executive Premium', 
    colors: {
      primary: '#2d3748',
      secondary: '#4a5568',
      accent: '#d69e2e'
    }
  },
  ats: {
    name: 'ATS Optimized',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666'
    }
  },
  creative: {
    name: 'Creative Tech',
    colors: {
      primary: '#553c9a',
      secondary: '#7c3aed',
      accent: '#8b5cf6'
    }
  }
};

// Generate HTML resume for preview and printing
export const generateHTMLResume = (resumeData, template = 'modern', sectionsEnabled = {}) => {
  const templateConfig = resumeTemplates[template];
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${resumeData.personal.name || 'Resume'} - QA Resume</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
          background: white;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid ${templateConfig.colors.primary};
          padding-bottom: 20px;
        }
        .name { 
          font-size: 28px; 
          font-weight: bold; 
          color: ${templateConfig.colors.primary}; 
          margin-bottom: 5px;
        }
        .title { 
          font-size: 18px; 
          color: ${templateConfig.colors.secondary}; 
          margin-bottom: 10px;
        }
        .contact { 
          font-size: 12px; 
          color: #666; 
          line-height: 1.4;
        }
        .section { 
          margin-bottom: 25px; 
        }
        .section-title { 
          font-size: 16px; 
          font-weight: bold; 
          color: ${templateConfig.colors.primary}; 
          text-transform: uppercase; 
          border-bottom: 1px solid ${templateConfig.colors.accent};
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .content { 
          font-size: 12px; 
          line-height: 1.5;
        }
        .experience-item, .project-item, .education-item { 
          margin-bottom: 15px; 
        }
        .item-header { 
          font-weight: bold; 
          color: ${templateConfig.colors.secondary};
          margin-bottom: 5px;
        }
        .item-details { 
          font-style: italic; 
          color: #666; 
          margin-bottom: 5px;
        }
        .achievements { 
          margin-left: 15px; 
        }
        .achievement { 
          margin-bottom: 3px; 
        }
        .skills-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 10px;
        }
        .skill-category { 
          margin-bottom: 10px;
        }
        .skill-category-title { 
          font-weight: bold; 
          color: ${templateConfig.colors.secondary};
          margin-bottom: 5px;
        }
        .competencies { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 8px;
        }
        .competency { 
          background: ${templateConfig.colors.accent}20; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 11px;
          border: 1px solid ${templateConfig.colors.accent};
        }
        @media print {
          body { margin: 0; padding: 0.3in; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${resumeData.personal.name || 'Your Name'}</div>
        <div class="title">${resumeData.personal.jobTitle || 'QA Engineer'}</div>
        <div class="contact">
          ${[
            resumeData.personal.email,
            resumeData.personal.phone,
            resumeData.personal.location,
            resumeData.personal.linkedin,
            resumeData.personal.github,
            resumeData.personal.portfolio
          ].filter(Boolean).join(' | ')}
        </div>
      </div>

      ${resumeData.summary ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="content">${resumeData.summary}</div>
        </div>
      ` : ''}

      ${resumeData.coreCompetencies && resumeData.coreCompetencies.length > 0 ? `
        <div class="section">
          <div class="section-title">Core Competencies</div>
          <div class="competencies">
            ${resumeData.coreCompetencies.map(comp => `<span class="competency">${comp}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${resumeData.technicalSkills ? `
        <div class="section">
          <div class="section-title">Technical Skills</div>
          <div class="skills-grid">
            ${Object.entries(resumeData.technicalSkills).map(([category, skills]) => {
              if (!skills || skills.length === 0) return '';
              const categoryName = category === 'testing' ? 'Testing Methodologies' : 
                                 category === 'automation' ? 'Automation Frameworks' :
                                 category === 'programming' ? 'Programming Languages' : 
                                 category === 'databases' ? 'Database Technologies' : 'Tools & Platforms';
              return `
                <div class="skill-category">
                  <div class="skill-category-title">${categoryName}</div>
                  <div>${skills.join(', ')}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      ${resumeData.experience && resumeData.experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Professional Experience</div>
          ${resumeData.experience.map(exp => `
            <div class="experience-item">
              <div class="item-header">${exp.role} - ${exp.company}</div>
              <div class="item-details">${exp.duration}${exp.location ? ` | ${exp.location}` : ''}</div>
              ${exp.achievements && exp.achievements.filter(Boolean).length > 0 ? `
                <div class="achievements">
                  ${exp.achievements.filter(Boolean).map(ach => `<div class="achievement">• ${ach}</div>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${resumeData.projects && resumeData.projects.length > 0 ? `
        <div class="section">
          <div class="section-title">Key Projects</div>
          ${resumeData.projects.map(project => `
            <div class="project-item">
              <div class="item-header">${project.title}</div>
              ${project.technologies ? `<div class="item-details">Technologies: ${project.technologies}</div>` : ''}
              ${project.description ? `<div>${project.description}</div>` : ''}
              ${project.impact ? `<div><strong>Impact:</strong> ${project.impact}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${sectionsEnabled.publications && resumeData.publications && resumeData.publications.length > 0 ? `
        <div class="section">
          <div class="section-title">Publications & Talks</div>
          ${resumeData.publications.map(pub => `
            <div class="project-item">
              <div class="item-header">"${pub.title}"</div>
              <div class="item-details">${pub.publication}${pub.date ? ` | ${pub.date}` : ''} | ${pub.type}</div>
              ${pub.url ? `<div><a href="${pub.url}">${pub.url}</a></div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${sectionsEnabled.openSource && resumeData.openSource && resumeData.openSource.length > 0 ? `
        <div class="section">
          <div class="section-title">Open Source Contributions</div>
          ${resumeData.openSource.map(os => `
            <div class="project-item">
              <div class="item-header">${os.project}${os.role ? ` (${os.role})` : ''}</div>
              ${os.description ? `<div>${os.description}</div>` : ''}
              ${os.technologies ? `<div><strong>Technologies:</strong> ${os.technologies}</div>` : ''}
              ${os.stars ? `<div><strong>Stars:</strong> ${os.stars}</div>` : ''}
              ${os.url ? `<div><a href="${os.url}">${os.url}</a></div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${sectionsEnabled.memberships && resumeData.memberships && resumeData.memberships.length > 0 ? `
        <div class="section">
          <div class="section-title">Professional Memberships</div>
          ${resumeData.memberships.map(member => `
            <div class="project-item">
              <div class="item-header">${member.organization}</div>
              <div class="item-details">${member.role}${member.since ? ` | Member since ${member.since}` : ''}${member.level ? ` | ${member.level} Level` : ''}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${sectionsEnabled.portfolio && resumeData.portfolio && resumeData.portfolio.length > 0 ? `
        <div class="section">
          <div class="section-title">Portfolio & Case Studies</div>
          ${resumeData.portfolio.map(item => `
            <div class="project-item">
              <div class="item-header">${item.title} (${item.type})</div>
              ${item.description ? `<div>${item.description}</div>` : ''}
              ${item.technologies ? `<div><strong>Technologies:</strong> ${item.technologies}</div>` : ''}
              ${item.url ? `<div><a href="${item.url}">${item.url}</a></div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${sectionsEnabled.patents && resumeData.patents && resumeData.patents.length > 0 ? `
        <div class="section">
          <div class="section-title">Patents & Innovations</div>
          ${resumeData.patents.map(patent => `
            <div class="project-item">
              <div class="item-header">"${patent.title}"</div>
              <div class="item-details">${patent.patentNumber ? `${patent.patentNumber} | ` : ''}${patent.status}${patent.date ? ` | ${patent.date}` : ''}</div>
              ${patent.description ? `<div>${patent.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${sectionsEnabled.achievements && resumeData.achievements && resumeData.achievements.length > 0 ? `
        <div class="section">
          <div class="section-title">Awards & Recognition</div>
          ${resumeData.achievements.map(ach => `
            <div class="project-item">
              <div class="item-header">${ach.title}</div>
              <div class="item-details">${ach.organization}${ach.year ? ` | ${ach.year}` : ''}</div>
              ${ach.description ? `<div>${ach.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${resumeData.certifications && resumeData.certifications.length > 0 ? `
        <div class="section">
          <div class="section-title">Certifications</div>
          ${resumeData.certifications.map(cert => `
            <div class="project-item">
              <div class="item-header">${cert.name}</div>
              <div class="item-details">${cert.organization}${cert.year ? ` | ${cert.year}` : ''}${cert.credentialId ? ` | ID: ${cert.credentialId}` : ''}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${resumeData.education && resumeData.education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${resumeData.education.map(edu => `
            <div class="education-item">
              <div class="item-header">${edu.degree}</div>
              <div class="item-details">${edu.university}${edu.year ? ` | ${edu.year}` : ''}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${sectionsEnabled.languages && resumeData.languages && resumeData.languages.length > 0 ? `
        <div class="section">
          <div class="section-title">Languages</div>
          <div class="content">
            ${resumeData.languages.map(lang => `${lang.language}: ${lang.proficiency}`).join(' | ')}
          </div>
        </div>
      ` : ''}

      ${sectionsEnabled.volunteer && resumeData.volunteer && resumeData.volunteer.length > 0 ? `
        <div class="section">
          <div class="section-title">Volunteer Experience</div>
          ${resumeData.volunteer.map(vol => `
            <div class="project-item">
              <div class="item-header">${vol.role} - ${vol.organization}</div>
              <div class="item-details">${vol.duration}</div>
              ${vol.description ? `<div>${vol.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </body>
    </html>
  `;

  return html;
};

// Preview resume in new window
export const previewResume = (resumeData, template = 'modern', sectionsEnabled = {}) => {
  const html = generateHTMLResume(resumeData, template, sectionsEnabled);
  const newWindow = window.open('', '_blank');
  newWindow.document.write(html);
  newWindow.document.close();
};

// Download as HTML file
export const downloadHTML = (resumeData, template = 'modern', sectionsEnabled = {}) => {
  const html = generateHTMLResume(resumeData, template, sectionsEnabled);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resumeData.personal.name || 'Resume'}_QA_Resume.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Print resume (opens print dialog)
export const printResume = (resumeData, template = 'modern', sectionsEnabled = {}) => {
  const html = generateHTMLResume(resumeData, template, sectionsEnabled);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
};