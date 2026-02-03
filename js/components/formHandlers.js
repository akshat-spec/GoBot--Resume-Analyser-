/**
 * GoBot - Form Handlers
 * Manages dynamic form elements and data collection
 */

const FormHandlers = {
    // Initialize all form handlers
    init() {
        this.initExperienceHandlers();
        this.initEducationHandlers();
        this.initProjectHandlers();
        this.initCertificationHandlers();
        this.initKeywordPreviews();
    },

    // Experience section handlers
    initExperienceHandlers() {
        const addBtn = document.getElementById('addExperience');
        const container = document.getElementById('experienceList');

        if (addBtn && container) {
            addBtn.addEventListener('click', () => {
                this.addExperienceEntry(container);
            });

            // Add initial empty entry
            if (container.children.length === 0) {
                this.addExperienceEntry(container);
            }
        }
    },

    // Add experience entry
    addExperienceEntry(container, data = {}) {
        const id = Date.now();
        const entry = document.createElement('div');
        entry.className = 'entry-item';
        entry.dataset.id = id;

        entry.innerHTML = `
            <button type="button" class="remove-entry" data-remove="${id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
            <div class="entry-form">
                <div class="row">
                    <div class="form-group">
                        <label>Job Title *</label>
                        <input type="text" name="exp-title-${id}" placeholder="Software Engineer" value="${data.title || ''}">
                    </div>
                    <div class="form-group">
                        <label>Company *</label>
                        <input type="text" name="exp-company-${id}" placeholder="Tech Corp Inc." value="${data.company || ''}">
                    </div>
                </div>
                <div class="row">
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" name="exp-location-${id}" placeholder="San Francisco, CA" value="${data.location || ''}">
                    </div>
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="text" name="exp-start-${id}" placeholder="Jan 2020" value="${data.startDate || ''}">
                    </div>
                </div>
                <div class="row">
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="text" name="exp-end-${id}" placeholder="Present" value="${data.endDate || ''}">
                    </div>
                    <div class="form-group"></div>
                </div>
                <div class="form-group full-width">
                    <label>Key Achievements (one per line)</label>
                    <div class="bullet-points" id="bullets-${id}">
                        <div class="bullet-point">
                            <input type="text" name="exp-bullet-${id}[]" placeholder="Developed a feature that increased user engagement by 25%">
                            <button type="button" class="remove-bullet">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <button type="button" class="add-bullet" data-container="bullets-${id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Add Achievement
                    </button>
                </div>
            </div>
        `;

        container.appendChild(entry);
        this.attachEntryListeners(entry, id);
    },

    // Education section handlers
    initEducationHandlers() {
        const addBtn = document.getElementById('addEducation');
        const container = document.getElementById('educationList');

        if (addBtn && container) {
            addBtn.addEventListener('click', () => {
                this.addEducationEntry(container);
            });

            // Add initial empty entry
            if (container.children.length === 0) {
                this.addEducationEntry(container);
            }
        }
    },

    // Add education entry
    addEducationEntry(container, data = {}) {
        const id = Date.now();
        const entry = document.createElement('div');
        entry.className = 'entry-item';
        entry.dataset.id = id;

        entry.innerHTML = `
            <button type="button" class="remove-entry" data-remove="${id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
            <div class="entry-form">
                <div class="row">
                    <div class="form-group">
                        <label>Degree *</label>
                        <input type="text" name="edu-degree-${id}" placeholder="Bachelor of Science" value="${data.degree || ''}">
                    </div>
                    <div class="form-group">
                        <label>Field of Study</label>
                        <input type="text" name="edu-field-${id}" placeholder="Computer Science" value="${data.field || ''}">
                    </div>
                </div>
                <div class="row">
                    <div class="form-group">
                        <label>School/University *</label>
                        <input type="text" name="edu-school-${id}" placeholder="Stanford University" value="${data.school || ''}">
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" name="edu-location-${id}" placeholder="Stanford, CA" value="${data.location || ''}">
                    </div>
                </div>
                <div class="row">
                    <div class="form-group">
                        <label>Graduation Date</label>
                        <input type="text" name="edu-date-${id}" placeholder="May 2020" value="${data.graduationDate || ''}">
                    </div>
                    <div class="form-group">
                        <label>GPA (optional)</label>
                        <input type="text" name="edu-gpa-${id}" placeholder="3.8" value="${data.gpa || ''}">
                    </div>
                </div>
            </div>
        `;

        container.appendChild(entry);
        this.attachEntryListeners(entry, id);
    },

    // Project section handlers
    initProjectHandlers() {
        const addBtn = document.getElementById('addProject');
        const container = document.getElementById('projectList');

        if (addBtn && container) {
            addBtn.addEventListener('click', () => {
                this.addProjectEntry(container);
            });
        }
    },

    // Add project entry
    addProjectEntry(container, data = {}) {
        const id = Date.now();
        const entry = document.createElement('div');
        entry.className = 'entry-item';
        entry.dataset.id = id;

        entry.innerHTML = `
            <button type="button" class="remove-entry" data-remove="${id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
            <div class="entry-form">
                <div class="row">
                    <div class="form-group">
                        <label>Project Name *</label>
                        <input type="text" name="proj-name-${id}" placeholder="E-commerce Platform" value="${data.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Technologies Used</label>
                        <input type="text" name="proj-tech-${id}" placeholder="React, Node.js, MongoDB" value="${data.technologies || ''}">
                    </div>
                </div>
                <div class="form-group full-width">
                    <label>Description</label>
                    <textarea name="proj-desc-${id}" rows="3" placeholder="Brief description of the project and your role...">${data.description || ''}</textarea>
                </div>
                <div class="form-group full-width">
                    <label>Project Link (optional)</label>
                    <input type="url" name="proj-link-${id}" placeholder="https://github.com/..." value="${data.link || ''}">
                </div>
            </div>
        `;

        container.appendChild(entry);
        this.attachEntryListeners(entry, id);
    },

    // Certification section handlers
    initCertificationHandlers() {
        const addBtn = document.getElementById('addCertification');
        const container = document.getElementById('certificationList');

        if (addBtn && container) {
            addBtn.addEventListener('click', () => {
                this.addCertificationEntry(container);
            });
        }
    },

    // Add certification entry
    addCertificationEntry(container, data = {}) {
        const id = Date.now();
        const entry = document.createElement('div');
        entry.className = 'entry-item';
        entry.dataset.id = id;

        entry.innerHTML = `
            <button type="button" class="remove-entry" data-remove="${id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
            <div class="entry-form">
                <div class="row">
                    <div class="form-group">
                        <label>Certification Name *</label>
                        <input type="text" name="cert-name-${id}" placeholder="AWS Solutions Architect" value="${data.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Issuing Organization</label>
                        <input type="text" name="cert-issuer-${id}" placeholder="Amazon Web Services" value="${data.issuer || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Date Obtained</label>
                    <input type="text" name="cert-date-${id}" placeholder="March 2023" value="${data.date || ''}">
                </div>
            </div>
        `;

        container.appendChild(entry);
        this.attachEntryListeners(entry, id);
    },

    // Attach event listeners to entry elements
    attachEntryListeners(entry, id) {
        // Remove entry button
        const removeBtn = entry.querySelector('.remove-entry');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                entry.remove();
            });
        }

        // Add bullet button
        const addBulletBtn = entry.querySelector('.add-bullet');
        if (addBulletBtn) {
            addBulletBtn.addEventListener('click', () => {
                const containerId = addBulletBtn.dataset.container;
                this.addBulletPoint(containerId);
            });
        }

        // Attach bullet remove listeners
        this.attachBulletListeners(entry);
    },

    // Add bullet point
    addBulletPoint(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const bulletDiv = document.createElement('div');
        bulletDiv.className = 'bullet-point';
        bulletDiv.innerHTML = `
            <input type="text" name="${containerId.replace('bullets-', 'exp-bullet-')}[]" placeholder="Describe your achievement with measurable impact...">
            <button type="button" class="remove-bullet">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        `;

        container.appendChild(bulletDiv);

        // Attach remove listener
        const removeBtn = bulletDiv.querySelector('.remove-bullet');
        removeBtn.addEventListener('click', () => {
            bulletDiv.remove();
        });

        // Focus the new input
        bulletDiv.querySelector('input').focus();
    },

    // Attach bullet point listeners
    attachBulletListeners(container) {
        const removeBtns = container.querySelectorAll('.remove-bullet');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.bullet-point').remove();
            });
        });
    },

    // Initialize keyword preview functionality
    initKeywordPreviews() {
        // Create mode job description
        const createJobDesc = document.getElementById('jobDescription');
        const createKeywordsPreview = document.getElementById('extractedKeywords');

        if (createJobDesc && createKeywordsPreview) {
            let debounceTimer;
            createJobDesc.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.updateKeywordsPreview(createJobDesc.value, createKeywordsPreview);
                }, 500);
            });
        }

        // Optimize mode job description
        const optimizeJobDesc = document.getElementById('targetJobDescription');
        const optimizeKeywordsPreview = document.getElementById('optimizeKeywords');

        if (optimizeJobDesc && optimizeKeywordsPreview) {
            let debounceTimer;
            optimizeJobDesc.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.updateKeywordsPreview(optimizeJobDesc.value, optimizeKeywordsPreview);
                }, 500);
            });
        }
    },

    // Update keywords preview
    updateKeywordsPreview(jobDescription, container) {
        if (!jobDescription || jobDescription.trim().length < 50) {
            container.classList.add('hidden');
            return;
        }

        const keywords = KeywordExtractor.extractFromJobDescription(jobDescription);
        const keywordsList = container.querySelector('.keywords-list');

        if (!keywordsList) return;

        const allKeywords = [...keywords.technical, ...keywords.soft].slice(0, 20);

        if (allKeywords.length === 0) {
            container.classList.add('hidden');
            return;
        }

        keywordsList.innerHTML = allKeywords.map(keyword =>
            `<span class="keyword-tag">${keyword}</span>`
        ).join('');

        container.classList.remove('hidden');
    },

    // Collect all form data
    collectFormData() {
        const data = {
            // Personal info
            fullName: document.getElementById('fullName')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            location: document.getElementById('location')?.value || '',
            linkedin: document.getElementById('linkedin')?.value || '',
            portfolio: document.getElementById('portfolio')?.value || '',

            // Summary
            summary: document.getElementById('summary')?.value || '',

            // Skills
            technicalSkills: document.getElementById('technicalSkills')?.value || '',
            softSkills: document.getElementById('softSkills')?.value || '',
            tools: document.getElementById('tools')?.value || '',

            // Experience
            experience: this.collectExperienceData(),

            // Education
            education: this.collectEducationData(),

            // Projects
            projects: this.collectProjectData(),

            // Certifications
            certifications: this.collectCertificationData()
        };

        return data;
    },

    // Collect experience entries
    collectExperienceData() {
        const container = document.getElementById('experienceList');
        if (!container) return [];

        const entries = container.querySelectorAll('.entry-item');
        return Array.from(entries).map(entry => {
            const id = entry.dataset.id;
            const bullets = Array.from(
                entry.querySelectorAll(`input[name="exp-bullet-${id}[]"]`)
            ).map(input => input.value).filter(v => v.trim());

            return {
                title: entry.querySelector(`input[name="exp-title-${id}"]`)?.value || '',
                company: entry.querySelector(`input[name="exp-company-${id}"]`)?.value || '',
                location: entry.querySelector(`input[name="exp-location-${id}"]`)?.value || '',
                startDate: entry.querySelector(`input[name="exp-start-${id}"]`)?.value || '',
                endDate: entry.querySelector(`input[name="exp-end-${id}"]`)?.value || '',
                bullets: bullets
            };
        }).filter(exp => exp.title || exp.company);
    },

    // Collect education entries
    collectEducationData() {
        const container = document.getElementById('educationList');
        if (!container) return [];

        const entries = container.querySelectorAll('.entry-item');
        return Array.from(entries).map(entry => {
            const id = entry.dataset.id;
            return {
                degree: entry.querySelector(`input[name="edu-degree-${id}"]`)?.value || '',
                field: entry.querySelector(`input[name="edu-field-${id}"]`)?.value || '',
                school: entry.querySelector(`input[name="edu-school-${id}"]`)?.value || '',
                location: entry.querySelector(`input[name="edu-location-${id}"]`)?.value || '',
                graduationDate: entry.querySelector(`input[name="edu-date-${id}"]`)?.value || '',
                gpa: entry.querySelector(`input[name="edu-gpa-${id}"]`)?.value || ''
            };
        }).filter(edu => edu.degree || edu.school);
    },

    // Collect project entries
    collectProjectData() {
        const container = document.getElementById('projectList');
        if (!container) return [];

        const entries = container.querySelectorAll('.entry-item');
        return Array.from(entries).map(entry => {
            const id = entry.dataset.id;
            return {
                name: entry.querySelector(`input[name="proj-name-${id}"]`)?.value || '',
                technologies: entry.querySelector(`input[name="proj-tech-${id}"]`)?.value || '',
                description: entry.querySelector(`textarea[name="proj-desc-${id}"]`)?.value || '',
                link: entry.querySelector(`input[name="proj-link-${id}"]`)?.value || ''
            };
        }).filter(proj => proj.name);
    },

    // Collect certification entries
    collectCertificationData() {
        const container = document.getElementById('certificationList');
        if (!container) return [];

        const entries = container.querySelectorAll('.entry-item');
        return Array.from(entries).map(entry => {
            const id = entry.dataset.id;
            return {
                name: entry.querySelector(`input[name="cert-name-${id}"]`)?.value || '',
                issuer: entry.querySelector(`input[name="cert-issuer-${id}"]`)?.value || '',
                date: entry.querySelector(`input[name="cert-date-${id}"]`)?.value || ''
            };
        }).filter(cert => cert.name);
    },

    // Validate required fields
    validateForm() {
        const errors = [];

        const fullName = document.getElementById('fullName')?.value;
        if (!fullName || fullName.trim().length === 0) {
            errors.push('Full name is required');
        }

        const email = document.getElementById('email')?.value;
        if (!email || !email.includes('@')) {
            errors.push('Valid email is required');
        }

        return errors;
    }
};

// Make available globally
window.FormHandlers = FormHandlers;
