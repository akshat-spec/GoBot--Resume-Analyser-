/**
 * GoBot - Preview Renderer
 * Renders resume preview in the modal
 */

const PreviewRenderer = {
    currentResume: null,
    currentKeywords: null,
    currentTemplate: 'modern',

    // Render resume preview
    render(resumeData, keywords = null, templateId = null) {
        this.currentResume = resumeData;
        this.currentKeywords = keywords;
        if (templateId) this.currentTemplate = templateId;

        const container = document.getElementById('resumePreviewContainer');
        if (!container) return;

        // Apply template styles
        const template = ResumeTemplates.getTemplate(this.currentTemplate);
        this.applyTemplate(this.currentTemplate);

        // Update container classes
        container.className = `resume-preview-container layout-${template.layout || 'modern'}`;

        const formatted = ResumeGenerator.formatForDisplay(resumeData);
        container.innerHTML = this.generatePreviewHTML(formatted, keywords);
    },

    // Apply template configuration
    applyTemplate(templateId) {
        const template = ResumeTemplates.getTemplate(templateId);
        this.applyColors(template.colors);
        this.applyFonts(template.fonts);

        // Update template select if it exists
        const select = document.getElementById('templateSelect');
        if (select) select.value = templateId;
    },

    // Apply color configuration to CSS variables
    applyColors(colors) {
        const root = document.documentElement;
        if (colors.primary) {
            root.style.setProperty('--resume-primary', colors.primary);
            // Also set RGB for highlighting
            const rgb = this.hexToRgb(colors.primary);
            if (rgb) {
                root.style.setProperty('--resume-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
            }
        }
        if (colors.secondary) root.style.setProperty('--resume-secondary', colors.secondary);
        if (colors.text) root.style.setProperty('--resume-text', colors.text);
        if (colors.border) root.style.setProperty('--resume-border', colors.border);
    },

    // Apply font configuration to CSS variables
    applyFonts(fonts) {
        const root = document.documentElement;
        if (fonts.header) root.style.setProperty('--resume-font-header', fonts.header);
        if (fonts.body) root.style.setProperty('--resume-font-body', fonts.body);
    },

    // Hex to RGB helper
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    // Generate preview HTML
    generatePreviewHTML(data, keywords) {
        const matchedKeywords = keywords ? keywords.all || [] : [];

        return `
            <div class="resume-header">
                <h1 class="resume-name">${this.escapeHtml(data.header.name)}</h1>
                <div class="resume-contact">
                    ${data.header.email ? `<span>${this.escapeHtml(data.header.email)}</span>` : ''}
                    ${data.header.phone ? `<span>${this.escapeHtml(data.header.phone)}</span>` : ''}
                    ${data.header.location ? `<span>${this.escapeHtml(data.header.location)}</span>` : ''}
                    ${data.header.linkedin ? `<span><a href="${this.escapeHtml(data.header.linkedin)}" target="_blank">LinkedIn</a></span>` : ''}
                    ${data.header.portfolio ? `<span><a href="${this.escapeHtml(data.header.portfolio)}" target="_blank">Portfolio</a></span>` : ''}
                </div>
            </div>

            ${data.summary ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Professional Summary</h2>
                <p class="resume-summary">${this.highlightKeywords(data.summary, matchedKeywords)}</p>
            </div>
            ` : ''}

            ${data.experience.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Professional Experience</h2>
                ${data.experience.map(exp => `
                <div class="resume-entry">
                    <div class="resume-entry-header">
                        <div>
                            <div class="resume-entry-title">${this.escapeHtml(exp.title)}</div>
                            <div class="resume-entry-subtitle">${this.escapeHtml(exp.company)}${exp.location ? ` | ${this.escapeHtml(exp.location)}` : ''}</div>
                        </div>
                        <div class="resume-entry-date">${this.escapeHtml(exp.startDate)} - ${this.escapeHtml(exp.endDate)}</div>
                    </div>
                    ${exp.bullets.length > 0 ? `
                    <ul class="resume-bullets">
                        ${exp.bullets.filter(b => b && b.trim()).map(bullet => `
                        <li>${this.highlightKeywords(bullet, matchedKeywords)}</li>
                        `).join('')}
                    </ul>
                    ` : ''}
                </div>
                `).join('')}
            </div>
            ` : ''}

            ${data.education.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Education</h2>
                ${data.education.map(edu => `
                <div class="resume-entry">
                    <div class="resume-entry-header">
                        <div>
                            <div class="resume-entry-title">${this.escapeHtml(edu.degree)}${edu.field ? ` in ${this.escapeHtml(edu.field)}` : ''}</div>
                            <div class="resume-entry-subtitle">${this.escapeHtml(edu.school)}${edu.location ? ` | ${this.escapeHtml(edu.location)}` : ''}</div>
                        </div>
                        <div class="resume-entry-date">${this.escapeHtml(edu.graduationDate)}</div>
                    </div>
                    ${edu.gpa ? `<div class="resume-entry-location">GPA: ${this.escapeHtml(edu.gpa)}</div>` : ''}
                </div>
                `).join('')}
            </div>
            ` : ''}

            ${(data.skills.technical || data.skills.soft || data.skills.tools) ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Skills</h2>
                <div class="resume-skills">
                    ${data.skills.technical ? `
                    <div class="resume-skill-category">
                        <span class="resume-skill-label">Technical:</span>
                        <span class="resume-skill-items">${this.highlightKeywords(data.skills.technical, matchedKeywords)}</span>
                    </div>
                    ` : ''}
                    ${data.skills.soft ? `
                    <div class="resume-skill-category">
                        <span class="resume-skill-label">Soft Skills:</span>
                        <span class="resume-skill-items">${this.highlightKeywords(data.skills.soft, matchedKeywords)}</span>
                    </div>
                    ` : ''}
                    ${data.skills.tools ? `
                    <div class="resume-skill-category">
                        <span class="resume-skill-label">Tools:</span>
                        <span class="resume-skill-items">${this.highlightKeywords(data.skills.tools, matchedKeywords)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            ${data.projects.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Projects</h2>
                ${data.projects.map(proj => `
                <div class="resume-project">
                    <div class="resume-project-header">
                        <span class="resume-project-title">${this.escapeHtml(proj.name)}</span>
                        ${proj.technologies ? `<span class="resume-project-tech">${this.highlightKeywords(proj.technologies, matchedKeywords)}</span>` : ''}
                    </div>
                    ${proj.description ? `<p class="resume-project-description">${this.highlightKeywords(proj.description, matchedKeywords)}</p>` : ''}
                </div>
                `).join('')}
            </div>
            ` : ''}

            ${data.certifications.length > 0 ? `
            <div class="resume-section">
                <h2 class="resume-section-title">Certifications</h2>
                <div class="resume-certifications">
                    ${data.certifications.map(cert => `
                    <div class="resume-certification">
                        <span class="resume-certification-name">${this.escapeHtml(cert.name)}</span>
                        ${cert.issuer ? `<span class="resume-certification-issuer"> - ${this.escapeHtml(cert.issuer)}</span>` : ''}
                        ${cert.date ? `<span class="resume-certification-date">, ${this.escapeHtml(cert.date)}</span>` : ''}
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
    },

    // Highlight matched keywords
    highlightKeywords(text, keywords) {
        if (!text || !keywords || keywords.length === 0) {
            return this.escapeHtml(text || '');
        }

        let result = this.escapeHtml(text);

        for (const keyword of keywords) {
            const regex = new RegExp(`\\b(${this.escapeRegex(keyword)})\\b`, 'gi');
            result = result.replace(regex, '<span class="keyword-highlight">$1</span>');
        }

        return result;
    },

    // Escape regex special characters
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    // Escape HTML
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Update ATS score display
    updateScoreDisplay(score) {
        // Update main score circle
        const scoreValue = document.getElementById('scoreValue');
        const scoreProgress = document.getElementById('scoreProgress');

        if (scoreValue) {
            scoreValue.textContent = score.overall;
        }

        if (scoreProgress) {
            // Calculate stroke dash offset (283 is the circumference)
            const offset = 283 - (283 * score.overall / 100);
            scoreProgress.style.strokeDashoffset = offset;

            // Update color based on score
            const color = ATSScoring.getScoreColor(score.overall);
            scoreProgress.style.stroke = color;
        }

        // Update breakdown
        this.updateProgressBar('keywords', score.breakdown.keywords);
        this.updateProgressBar('format', score.breakdown.format);
        this.updateProgressBar('content', score.breakdown.content);

        // Update tips
        const tipsList = document.getElementById('tipsList');
        if (tipsList && score.tips) {
            tipsList.innerHTML = score.tips.map(tip =>
                `<li>${this.escapeHtml(tip.text)}</li>`
            ).join('');
        }
    },

    // Update individual progress bar
    updateProgressBar(name, value) {
        const progress = document.getElementById(`${name}Progress`);
        const valueEl = document.getElementById(`${name}Value`);

        if (progress) {
            progress.style.width = `${value}%`;
        }

        if (valueEl) {
            valueEl.textContent = `${Math.round(value)}%`;
        }
    },

    // Update suggestions display
    updateSuggestions(suggestions) {
        const container = document.getElementById('suggestionsList');
        if (!container) return;

        if (!suggestions || suggestions.length === 0) {
            container.innerHTML = '<p class="empty-state">No additional skills suggested</p>';
            return;
        }

        container.innerHTML = suggestions.map(sugg => `
            <span class="suggestion-tag" data-skill="${this.escapeHtml(sugg.skill)}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
                ${this.escapeHtml(sugg.skill)}
            </span>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.suggestion-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const skill = tag.dataset.skill;
                this.addSuggestedSkill(skill);
                tag.classList.add('added');
                tag.innerHTML = `✓ ${skill}`;
            });
        });
    },

    // Add suggested skill to form
    addSuggestedSkill(skill) {
        const technicalSkills = document.getElementById('technicalSkills');
        if (technicalSkills) {
            const current = technicalSkills.value.trim();
            technicalSkills.value = current ? `${current}, ${skill}` : skill;
        }
    },

    // Update changes display (for optimize mode)
    updateChangesDisplay(changes) {
        const container = document.getElementById('changesList');
        if (!container) return;

        if (!changes || changes.length === 0) {
            container.innerHTML = '<p class="empty-state">No changes made</p>';
            return;
        }

        container.innerHTML = changes.map(change => `
            <div class="change-item">
                <span class="change-type ${change.type}">${change.type}</span>
                <span class="change-text">
                    ${change.text}
                    ${change.keywords ? change.keywords.map(k => `<mark>${this.escapeHtml(k)}</mark>`).join(', ') : ''}
                </span>
            </div>
        `).join('');
    },

    // Update missing keywords display
    updateMissingDisplay(missing) {
        const container = document.getElementById('missingList');
        if (!container) return;

        if (!missing || missing.length === 0) {
            container.innerHTML = '<p class="empty-state">All important keywords present!</p>';
            return;
        }

        container.innerHTML = missing.slice(0, 10).map(keyword => `
            <span class="missing-tag clickable" data-keyword="${this.escapeHtml(keyword)}">${this.escapeHtml(keyword)}</span>
        `).join('');
    },

    // Update analysis scores
    updateAnalysisScores(beforeScore, afterScore) {
        const before = document.getElementById('beforeScore');
        const after = document.getElementById('afterScore');

        if (before) {
            before.textContent = beforeScore;
        }

        if (after) {
            after.textContent = afterScore;
        }
    },

    // Show preview modal
    showModal() {
        const modal = document.getElementById('previewModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    // Hide preview modal
    hideModal() {
        const modal = document.getElementById('previewModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    // Get current resume data
    getCurrentResume() {
        return this.currentResume;
    },

    // Get current keywords
    getCurrentKeywords() {
        return this.currentKeywords;
    }
};

// Make available globally
window.PreviewRenderer = PreviewRenderer;
