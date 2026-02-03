/**
 * GoBot - PDF Export
 * Generates professional PDF resumes
 */

const ExportPDF = {
    // Generate PDF from resume data
    async generatePDF(resumeData) {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            throw new Error('Popup blocked. Please allow popups for PDF export.');
        }

        const htmlContent = this.generatePDFHTML(resumeData);

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
            }, 500);
        };

        return true;
    },

    // Generate HTML optimized for PDF printing
    generatePDFHTML(data) {
        const formatted = ResumeGenerator.formatForDisplay(data);

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formatted.header.name} - Resume</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Open+Sans:wght@400;600&display=swap');
        
        @page {
            margin: 0.5in;
            size: letter;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #1a1a1a;
            background: white;
        }
        
        .resume {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.25in;
        }
        
        /* Header */
        .resume-header {
            text-align: center;
            padding-bottom: 12px;
            border-bottom: 2px solid #2c3e50;
            margin-bottom: 16px;
        }
        
        .resume-name {
            font-family: 'Merriweather', Georgia, serif;
            font-size: 22pt;
            font-weight: 700;
            color: #2c3e50;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        
        .resume-contact {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px;
            font-size: 9pt;
            color: #555;
        }
        
        .resume-contact span {
            display: inline-flex;
            align-items: center;
        }
        
        .resume-contact a {
            color: #555;
            text-decoration: none;
        }
        
        /* Sections */
        .section {
            margin-bottom: 14px;
        }
        
        .section-title {
            font-family: 'Merriweather', Georgia, serif;
            font-size: 11pt;
            font-weight: 700;
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding-bottom: 4px;
            border-bottom: 1px solid #bdc3c7;
            margin-bottom: 10px;
        }
        
        .section-content {
            padding-left: 2px;
        }
        
        /* Summary */
        .summary-text {
            font-size: 10pt;
            color: #333;
            text-align: justify;
            line-height: 1.5;
        }
        
        /* Experience & Education */
        .entry {
            margin-bottom: 12px;
        }
        
        .entry:last-child {
            margin-bottom: 0;
        }
        
        .entry-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 4px;
        }
        
        .entry-title {
            font-weight: 700;
            font-size: 10.5pt;
            color: #1a1a1a;
        }
        
        .entry-subtitle {
            font-style: italic;
            color: #555;
            font-size: 10pt;
        }
        
        .entry-date {
            font-size: 9pt;
            color: #666;
            text-align: right;
            white-space: nowrap;
        }
        
        .entry-location {
            font-size: 9pt;
            color: #666;
        }
        
        /* Bullets */
        .bullets {
            list-style: none;
            margin-top: 6px;
        }
        
        .bullets li {
            position: relative;
            padding-left: 14px;
            margin-bottom: 3px;
            font-size: 9.5pt;
            color: #333;
            line-height: 1.4;
        }
        
        .bullets li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #2c3e50;
            font-weight: bold;
        }
        
        /* Skills */
        .skills-grid {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .skill-row {
            display: flex;
            font-size: 9.5pt;
        }
        
        .skill-label {
            font-weight: 600;
            color: #2c3e50;
            min-width: 120px;
        }
        
        .skill-items {
            color: #333;
        }
        
        /* Projects */
        .project {
            margin-bottom: 10px;
        }
        
        .project:last-child {
            margin-bottom: 0;
        }
        
        .project-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .project-title {
            font-weight: 700;
            font-size: 10pt;
            color: #1a1a1a;
        }
        
        .project-tech {
            font-style: italic;
            font-size: 9pt;
            color: #666;
        }
        
        .project-description {
            font-size: 9.5pt;
            color: #333;
            margin-top: 3px;
        }
        
        /* Certifications */
        .certifications-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .certification {
            font-size: 9.5pt;
        }
        
        .certification-name {
            font-weight: 600;
            color: #1a1a1a;
        }
        
        .certification-details {
            color: #666;
        }
        
        /* Print optimization */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .resume {
                padding: 0;
            }
            
            .section {
                page-break-inside: avoid;
            }
            
            .entry {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="resume">
        <!-- Header -->
        <header class="resume-header">
            <h1 class="resume-name">${this.escapeHtml(formatted.header.name)}</h1>
            <div class="resume-contact">
                ${formatted.header.email ? `<span>${this.escapeHtml(formatted.header.email)}</span>` : ''}
                ${formatted.header.phone ? `<span>${this.escapeHtml(formatted.header.phone)}</span>` : ''}
                ${formatted.header.location ? `<span>${this.escapeHtml(formatted.header.location)}</span>` : ''}
                ${formatted.header.linkedin ? `<span><a href="${this.escapeHtml(formatted.header.linkedin)}">${this.escapeHtml(formatted.header.linkedin)}</a></span>` : ''}
                ${formatted.header.portfolio ? `<span><a href="${this.escapeHtml(formatted.header.portfolio)}">${this.escapeHtml(formatted.header.portfolio)}</a></span>` : ''}
            </div>
        </header>
        
        <!-- Summary -->
        ${formatted.summary ? `
        <section class="section">
            <h2 class="section-title">Professional Summary</h2>
            <div class="section-content">
                <p class="summary-text">${this.escapeHtml(formatted.summary)}</p>
            </div>
        </section>
        ` : ''}
        
        <!-- Experience -->
        ${formatted.experience.length > 0 ? `
        <section class="section">
            <h2 class="section-title">Professional Experience</h2>
            <div class="section-content">
                ${formatted.experience.map(exp => `
                <div class="entry">
                    <div class="entry-header">
                        <div>
                            <div class="entry-title">${this.escapeHtml(exp.title)}</div>
                            <div class="entry-subtitle">${this.escapeHtml(exp.company)}${exp.location ? ` | ${this.escapeHtml(exp.location)}` : ''}</div>
                        </div>
                        <div class="entry-date">${this.escapeHtml(exp.startDate)} - ${this.escapeHtml(exp.endDate)}</div>
                    </div>
                    ${exp.bullets.length > 0 ? `
                    <ul class="bullets">
                        ${exp.bullets.filter(b => b && b.trim()).map(bullet => `
                        <li>${this.escapeHtml(bullet)}</li>
                        `).join('')}
                    </ul>
                    ` : ''}
                </div>
                `).join('')}
            </div>
        </section>
        ` : ''}
        
        <!-- Education -->
        ${formatted.education.length > 0 ? `
        <section class="section">
            <h2 class="section-title">Education</h2>
            <div class="section-content">
                ${formatted.education.map(edu => `
                <div class="entry">
                    <div class="entry-header">
                        <div>
                            <div class="entry-title">${this.escapeHtml(edu.degree)}${edu.field ? ` in ${this.escapeHtml(edu.field)}` : ''}</div>
                            <div class="entry-subtitle">${this.escapeHtml(edu.school)}${edu.location ? ` | ${this.escapeHtml(edu.location)}` : ''}</div>
                        </div>
                        <div class="entry-date">${this.escapeHtml(edu.graduationDate)}</div>
                    </div>
                    ${edu.gpa ? `<div class="entry-location">GPA: ${this.escapeHtml(edu.gpa)}</div>` : ''}
                </div>
                `).join('')}
            </div>
        </section>
        ` : ''}
        
        <!-- Skills -->
        ${(formatted.skills.technical || formatted.skills.soft || formatted.skills.tools) ? `
        <section class="section">
            <h2 class="section-title">Skills</h2>
            <div class="section-content">
                <div class="skills-grid">
                    ${formatted.skills.technical ? `
                    <div class="skill-row">
                        <span class="skill-label">Technical:</span>
                        <span class="skill-items">${this.escapeHtml(formatted.skills.technical)}</span>
                    </div>
                    ` : ''}
                    ${formatted.skills.soft ? `
                    <div class="skill-row">
                        <span class="skill-label">Soft Skills:</span>
                        <span class="skill-items">${this.escapeHtml(formatted.skills.soft)}</span>
                    </div>
                    ` : ''}
                    ${formatted.skills.tools ? `
                    <div class="skill-row">
                        <span class="skill-label">Tools:</span>
                        <span class="skill-items">${this.escapeHtml(formatted.skills.tools)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        </section>
        ` : ''}
        
        <!-- Projects -->
        ${formatted.projects.length > 0 ? `
        <section class="section">
            <h2 class="section-title">Projects</h2>
            <div class="section-content">
                ${formatted.projects.map(proj => `
                <div class="project">
                    <div class="project-header">
                        <span class="project-title">${this.escapeHtml(proj.name)}</span>
                        ${proj.technologies ? `<span class="project-tech">${this.escapeHtml(proj.technologies)}</span>` : ''}
                    </div>
                    ${proj.description ? `<p class="project-description">${this.escapeHtml(proj.description)}</p>` : ''}
                </div>
                `).join('')}
            </div>
        </section>
        ` : ''}
        
        <!-- Certifications -->
        ${formatted.certifications.length > 0 ? `
        <section class="section">
            <h2 class="section-title">Certifications</h2>
            <div class="section-content">
                <div class="certifications-list">
                    ${formatted.certifications.map(cert => `
                    <div class="certification">
                        <span class="certification-name">${this.escapeHtml(cert.name)}</span>
                        ${cert.issuer || cert.date ? `
                        <span class="certification-details"> - ${this.escapeHtml(cert.issuer)}${cert.date ? `, ${this.escapeHtml(cert.date)}` : ''}</span>
                        ` : ''}
                    </div>
                    `).join('')}
                </div>
            </div>
        </section>
        ` : ''}
    </div>
</body>
</html>`;
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Make available globally
window.ExportPDF = ExportPDF;
