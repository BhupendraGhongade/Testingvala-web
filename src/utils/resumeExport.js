// Resume Export Utilities for PDF and DOCX generation
import jsPDF from 'jspdf';

// Professional Resume Templates
export const resumeTemplates = {
  modern: {
    name: 'Modern Professional',
    colors: {
      primary: '#1a365d',
      secondary: '#2c5282',
      accent: '#3182ce',
      text: '#2d3748',
      lightText: '#4a5568'
    },
    fonts: {
      primary: 'Arial',
      secondary: 'Arial'
    }
  },
  executive: {
    name: 'Executive Premium',
    colors: {
      primary: '#2d3748',
      secondary: '#4a5568',
      accent: '#d69e2e',
      text: '#1a202c',
      lightText: '#718096'
    },
    fonts: {
      primary: 'Times',
      secondary: 'Arial'
    }
  },
  ats: {
    name: 'ATS Optimized',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666',
      text: '#000000',
      lightText: '#333333'
    },
    fonts: {
      primary: 'Arial',
      secondary: 'Arial'
    }
  },
  creative: {
    name: 'Creative Tech',
    colors: {
      primary: '#553c9a',
      secondary: '#7c3aed',
      accent: '#8b5cf6',
      text: '#374151',
      lightText: '#6b7280'
    },
    fonts: {
      primary: 'Arial',
      secondary: 'Arial'
    }
  }
};

// Generate PDF Resume
export const generatePDFResume = (resumeData, template = 'modern', sectionsEnabled = {}) => {
  const doc = new jsPDF();
  const templateConfig = resumeTemplates[template];
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper functions
  const addSection = (title, content, fontSize = 12) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Section title
    doc.setFontSize(14);
    doc.setFont('Arial', 'bold');
    doc.setTextColor(templateConfig.colors.primary);
    doc.text(title.toUpperCase(), margin, yPosition);
    yPosition += 8;
    
    // Section content
    doc.setFontSize(fontSize);
    doc.setFont('Arial', 'normal');
    doc.setTextColor(templateConfig.colors.text);
    
    if (Array.isArray(content)) {
      content.forEach(item => {
        if (typeof item === 'string') {
          const lines = doc.splitTextToSize(item, contentWidth);
          doc.text(lines, margin, yPosition);
          yPosition += lines.length * 5;
        } else if (typeof item === 'object') {
          // Handle complex objects
          Object.entries(item).forEach(([key, value]) => {
            if (value && value.toString().trim()) {
              doc.text(`${key}: ${value}`, margin, yPosition);
              yPosition += 5;
            }
          });
        }
        yPosition += 3;
      });
    } else {
      const lines = doc.splitTextToSize(content, contentWidth);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 5;
    }
    
    yPosition += 5;
  };

  // Header with personal information
  doc.setFontSize(20);
  doc.setFont('Arial', 'bold');
  doc.setTextColor(templateConfig.colors.primary);
  doc.text(resumeData.personal.name || 'Your Name', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(14);
  doc.setFont('Arial', 'normal');
  doc.setTextColor(templateConfig.colors.secondary);
  doc.text(resumeData.personal.jobTitle || 'QA Engineer', margin, yPosition);
  yPosition += 10;

  // Contact information
  doc.setFontSize(10);
  doc.setTextColor(templateConfig.colors.text);
  const contactInfo = [
    resumeData.personal.email,
    resumeData.personal.phone,
    resumeData.personal.location,
    resumeData.personal.linkedin,
    resumeData.personal.github,
    resumeData.personal.portfolio
  ].filter(Boolean).join(' | ');
  
  const contactLines = doc.splitTextToSize(contactInfo, contentWidth);
  doc.text(contactLines, margin, yPosition);
  yPosition += contactLines.length * 4 + 10;

  // Professional Summary
  if (resumeData.summary) {
    addSection('Professional Summary', resumeData.summary);
  }

  // Core Competencies
  if (resumeData.coreCompetencies && resumeData.coreCompetencies.length > 0) {
    addSection('Core Competencies', resumeData.coreCompetencies.join(' • '));
  }

  // Technical Skills
  if (resumeData.technicalSkills) {
    const skillsContent = [];
    Object.entries(resumeData.technicalSkills).forEach(([category, skills]) => {
      if (skills && skills.length > 0) {
        const categoryName = category === 'testing' ? 'Testing Methodologies' : 
                           category === 'automation' ? 'Automation Frameworks' :
                           category === 'programming' ? 'Programming Languages' : 
                           category === 'databases' ? 'Database Technologies' : 'Tools & Platforms';
        skillsContent.push(`${categoryName}: ${skills.join(', ')}`);
      }
    });
    if (skillsContent.length > 0) {
      addSection('Technical Skills', skillsContent);
    }
  }

  // Work Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    const expContent = resumeData.experience.map(exp => {
      let expText = `${exp.role} at ${exp.company}`;
      if (exp.duration) expText += ` (${exp.duration})`;
      if (exp.location) expText += ` - ${exp.location}`;
      
      if (exp.achievements && exp.achievements.length > 0) {
        const achievements = exp.achievements.filter(Boolean).map(ach => `• ${ach}`).join('\n');
        expText += '\n' + achievements;
      }
      
      return expText;
    });
    addSection('Professional Experience', expContent);
  }

  // Projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    const projectContent = resumeData.projects.map(project => {
      let projectText = project.title;
      if (project.technologies) projectText += ` (${project.technologies})`;
      if (project.description) projectText += `\n${project.description}`;
      if (project.impact) projectText += `\nImpact: ${project.impact}`;
      return projectText;
    });
    addSection('Key Projects', projectContent);
  }

  // Publications (if enabled)
  if (sectionsEnabled.publications && resumeData.publications && resumeData.publications.length > 0) {
    const pubContent = resumeData.publications.map(pub => {
      let pubText = `"${pub.title}"`;
      if (pub.publication) pubText += ` - ${pub.publication}`;
      if (pub.date) pubText += ` (${pub.date})`;
      if (pub.url) pubText += `\n${pub.url}`;
      return pubText;
    });
    addSection('Publications & Talks', pubContent);
  }

  // Open Source (if enabled)
  if (sectionsEnabled.openSource && resumeData.openSource && resumeData.openSource.length > 0) {
    const osContent = resumeData.openSource.map(os => {
      let osText = `${os.project}`;
      if (os.role) osText += ` (${os.role})`;
      if (os.description) osText += `\n${os.description}`;
      if (os.technologies) osText += `\nTechnologies: ${os.technologies}`;
      if (os.stars) osText += ` | ${os.stars} stars`;
      if (os.url) osText += `\n${os.url}`;
      return osText;
    });
    addSection('Open Source Contributions', osContent);
  }

  // Professional Memberships (if enabled)
  if (sectionsEnabled.memberships && resumeData.memberships && resumeData.memberships.length > 0) {
    const memberContent = resumeData.memberships.map(member => {
      let memberText = member.organization;
      if (member.role) memberText += ` - ${member.role}`;
      if (member.since) memberText += ` (${member.since})`;
      if (member.level) memberText += ` | ${member.level} Level`;
      return memberText;
    });
    addSection('Professional Memberships', memberContent);
  }

  // Portfolio (if enabled)
  if (sectionsEnabled.portfolio && resumeData.portfolio && resumeData.portfolio.length > 0) {
    const portfolioContent = resumeData.portfolio.map(item => {
      let portfolioText = `${item.title} (${item.type})`;
      if (item.description) portfolioText += `\n${item.description}`;
      if (item.technologies) portfolioText += `\nTechnologies: ${item.technologies}`;
      if (item.url) portfolioText += `\n${item.url}`;
      return portfolioText;
    });
    addSection('Portfolio & Case Studies', portfolioContent);
  }

  // Patents (if enabled)
  if (sectionsEnabled.patents && resumeData.patents && resumeData.patents.length > 0) {
    const patentContent = resumeData.patents.map(patent => {
      let patentText = `"${patent.title}"`;
      if (patent.patentNumber) patentText += ` - ${patent.patentNumber}`;
      if (patent.status) patentText += ` (${patent.status})`;
      if (patent.date) patentText += ` | ${patent.date}`;
      if (patent.description) patentText += `\n${patent.description}`;
      return patentText;
    });
    addSection('Patents & Innovations', patentContent);
  }

  // Achievements (if enabled)
  if (sectionsEnabled.achievements && resumeData.achievements && resumeData.achievements.length > 0) {
    const achievementContent = resumeData.achievements.map(ach => {
      let achText = ach.title;
      if (ach.organization) achText += ` - ${ach.organization}`;
      if (ach.year) achText += ` (${ach.year})`;
      if (ach.description) achText += `\n${ach.description}`;
      return achText;
    });
    addSection('Awards & Recognition', achievementContent);
  }

  // Certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    const certContent = resumeData.certifications.map(cert => {
      let certText = cert.name;
      if (cert.organization) certText += ` - ${cert.organization}`;
      if (cert.year) certText += ` (${cert.year})`;
      if (cert.credentialId) certText += ` | ID: ${cert.credentialId}`;
      return certText;
    });
    addSection('Certifications', certContent);
  }

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    const eduContent = resumeData.education.map(edu => {
      let eduText = edu.degree;
      if (edu.university) eduText += ` - ${edu.university}`;
      if (edu.year) eduText += ` (${edu.year})`;
      if (edu.gpa) eduText += ` | GPA: ${edu.gpa}`;
      return eduText;
    });
    addSection('Education', eduContent);
  }

  // Languages (if enabled)
  if (sectionsEnabled.languages && resumeData.languages && resumeData.languages.length > 0) {
    const langContent = resumeData.languages.map(lang => 
      `${lang.language}: ${lang.proficiency}`
    );
    addSection('Languages', langContent.join(' | '));
  }

  // Volunteer Work (if enabled)
  if (sectionsEnabled.volunteer && resumeData.volunteer && resumeData.volunteer.length > 0) {
    const volContent = resumeData.volunteer.map(vol => {
      let volText = `${vol.role} at ${vol.organization}`;
      if (vol.duration) volText += ` (${vol.duration})`;
      if (vol.description) volText += `\n${vol.description}`;
      return volText;
    });
    addSection('Volunteer Experience', volContent);
  }

  return doc;
};

// Generate DOCX Resume (simplified version - would need docx library for full implementation)
export const generateDOCXResume = (resumeData, template = 'modern', sectionsEnabled = {}) => {
  // This would require the 'docx' library for full implementation
  // For now, we'll create a structured text format that can be easily converted
  
  const templateConfig = resumeTemplates[template];
  let content = '';

  // Header
  content += `${resumeData.personal.name || 'Your Name'}\n`;
  content += `${resumeData.personal.jobTitle || 'QA Engineer'}\n\n`;
  
  // Contact Info
  const contactInfo = [
    resumeData.personal.email,
    resumeData.personal.phone,
    resumeData.personal.location,
    resumeData.personal.linkedin,
    resumeData.personal.github,
    resumeData.personal.portfolio
  ].filter(Boolean).join(' | ');
  content += `${contactInfo}\n\n`;

  // Professional Summary
  if (resumeData.summary) {
    content += `PROFESSIONAL SUMMARY\n`;
    content += `${resumeData.summary}\n\n`;
  }

  // Core Competencies
  if (resumeData.coreCompetencies && resumeData.coreCompetencies.length > 0) {
    content += `CORE COMPETENCIES\n`;
    content += `${resumeData.coreCompetencies.join(' • ')}\n\n`;
  }

  // Technical Skills
  if (resumeData.technicalSkills) {
    content += `TECHNICAL SKILLS\n`;
    Object.entries(resumeData.technicalSkills).forEach(([category, skills]) => {
      if (skills && skills.length > 0) {
        const categoryName = category === 'testing' ? 'Testing Methodologies' : 
                           category === 'automation' ? 'Automation Frameworks' :
                           category === 'programming' ? 'Programming Languages' : 
                           category === 'databases' ? 'Database Technologies' : 'Tools & Platforms';
        content += `${categoryName}: ${skills.join(', ')}\n`;
      }
    });
    content += '\n';
  }

  // Add other sections similarly...
  // This is a simplified version. Full DOCX generation would require proper formatting

  return content;
};

// Export functions
export const downloadPDF = (resumeData, template = 'modern', sectionsEnabled = {}) => {
  const doc = generatePDFResume(resumeData, template, sectionsEnabled);
  const fileName = `${resumeData.personal.name || 'Resume'}_QA_Resume.pdf`;
  doc.save(fileName);
};

export const downloadDOCX = (resumeData, template = 'modern', sectionsEnabled = {}) => {
  const content = generateDOCXResume(resumeData, template, sectionsEnabled);
  const fileName = `${resumeData.personal.name || 'Resume'}_QA_Resume.txt`;
  
  // Create and download text file (would be DOCX with proper library)
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Preview function
export const previewResume = (resumeData, template = 'modern', sectionsEnabled = {}) => {
  const doc = generatePDFResume(resumeData, template, sectionsEnabled);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};