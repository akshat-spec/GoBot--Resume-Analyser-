/**
 * GoBot - AI Resume Optimizer
 * Main Application Controller
 */

const App = {
    currentMode: 'create',
    generatedResume: null,
    optimizedResume: null,
    currentKeywords: null,

    // Initialize the application
    init() {
        this.initTheme();
        this.initModeSwitch();
        this.initModalHandlers();
        this.initGenerateButton();
        this.initOptimizeButton();
        this.initExportButtons();
        this.initEditorModal();
        this.initTemplateHandlers();
        this.initNavigation();

        // Initialize form handlers
        FormHandlers.init();

        // Initialize file upload (if available)
        if (window.FileUpload) {
            FileUpload.init();
        }

        // Add SVG gradient definition for score circle
        this.addSVGDefs();

        // Check backend availability
        this.checkBackendStatus();

        console.log('GoBot initialized successfully!');
    },

    // Check if Python backend is available
    async checkBackendStatus() {
        if (window.API) {
            const available = await API.isBackendAvailable();
            if (available) {
                console.log('Python backend connected at http://localhost:5000');
            } else {
                console.log('Python backend not available. Using client-side processing.');
            }
        }
    },

    // Initialize theme handling
    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('gobot-theme') || 'light';

        document.documentElement.setAttribute('data-theme', savedTheme);

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const newTheme = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('gobot-theme', newTheme);
            });
        }
    },

    // Initialize mode switching
    initModeSwitch() {
        const modeBtns = document.querySelectorAll('.mode-btn');

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.switchMode(mode);

                // Update button states
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    },

    // Initialize navigation for landing page and app
    initNavigation() {
        // Nav Links
        const getStartedBtn = document.getElementById('getStartedNav');
        const heroStartBtn = document.getElementById('heroStart');
        const heroOptimizeBtn = document.getElementById('heroOptimize');
        const backToHomeBtn = document.getElementById('backToHome');
        const logo = document.querySelector('.logo');

        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                this.switchView('app');
                this.switchMode('create');
            });
        }

        if (heroStartBtn) {
            heroStartBtn.addEventListener('click', () => {
                this.switchView('app');
                this.switchMode('create');
            });
        }

        if (heroOptimizeBtn) {
            heroOptimizeBtn.addEventListener('click', () => {
                this.switchView('app');
                this.switchMode('optimize');
            });
        }

        if (backToHomeBtn) {
            backToHomeBtn.addEventListener('click', () => {
                this.switchView('landing');
            });
        }

        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => {
                this.switchView('landing');
            });
        }

        // Smooth Scrolling for Hash Links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Footer Legal Links
        const viewPrivacy = document.getElementById('viewPrivacy');
        const viewTerms = document.getElementById('viewTerms');
        const viewApp = document.getElementById('viewApp');

        if (viewPrivacy) {
            viewPrivacy.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView('privacy');
            });
        }

        if (viewTerms) {
            viewTerms.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView('terms');
            });
        }

        if (viewApp) {
            viewApp.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView('app');
            });
        }
    },

    // Switch between landing page, app, and legal pages
    switchView(view) {
        const landingPage = document.getElementById('landingPage');
        const appContainer = document.getElementById('appContainer');
        const privacySection = document.getElementById('privacy');
        const termsSection = document.getElementById('terms');
        const hero = document.getElementById('home');
        const features = document.getElementById('features');
        const pricing = document.getElementById('pricing');
        const about = document.getElementById('about');
        const contact = document.getElementById('contact');

        // Hide everything first
        [hero, features, pricing, about, contact, privacySection, termsSection].forEach(el => {
            el?.classList.add('hidden');
        });

        if (view === 'app') {
            landingPage?.classList.remove('active');
            appContainer?.classList.remove('hidden');
            window.scrollTo(0, 0);
        } else if (view === 'landing') {
            landingPage?.classList.add('active');
            appContainer?.classList.add('hidden');
            [hero, features, pricing, about, contact].forEach(el => el?.classList.remove('hidden'));
        } else if (view === 'privacy') {
            landingPage?.classList.add('active');
            appContainer?.classList.add('hidden');
            privacySection?.classList.remove('hidden');
            window.scrollTo(0, 0);
        } else if (view === 'terms') {
            landingPage?.classList.add('active');
            appContainer?.classList.add('hidden');
            termsSection?.classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    },

    // Switch between create and optimize modes
    switchMode(mode) {
        this.currentMode = mode;

        const createSection = document.getElementById('createMode');
        const optimizeSection = document.getElementById('optimizeMode');
        const modeBtns = document.querySelectorAll('.mode-btn');

        if (mode === 'create') {
            createSection?.classList.add('active');
            optimizeSection?.classList.remove('active');
        } else {
            createSection?.classList.remove('active');
            optimizeSection?.classList.add('active');
        }

        // Update mode buttons
        modeBtns.forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    // Initialize modal handlers
    initModalHandlers() {
        // Preview modal
        const previewModal = document.getElementById('previewModal');
        const closePreview = document.getElementById('closePreview');
        const backdrop = previewModal?.querySelector('.modal-backdrop');

        if (closePreview) {
            closePreview.addEventListener('click', () => PreviewRenderer.hideModal());
        }

        if (backdrop) {
            backdrop.addEventListener('click', () => PreviewRenderer.hideModal());
        }

        // Toggle Customizer
        const toggleCustomizer = document.getElementById('toggleCustomizer');
        if (toggleCustomizer) {
            toggleCustomizer.addEventListener('click', () => {
                document.getElementById('customizationPanel')?.classList.toggle('active');
            });
        }

        // Edit sections button
        const editSections = document.getElementById('editSections');
        if (editSections) {
            editSections.addEventListener('click', () => {
                PreviewRenderer.hideModal();
                this.openEditorModal();
            });
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                PreviewRenderer.hideModal();
                this.closeEditorModal();
            }
        });
    },

    // Initialize generate button
    initGenerateButton() {
        const generateBtn = document.getElementById('generateResume');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateResume());
        }
    },

    // Generate resume from form data
    async generateResume() {
        // Validate form
        const errors = FormHandlers.validateForm();
        if (errors.length > 0) {
            this.showToast(errors[0], 'error');
            return;
        }

        // Show loading
        this.showLoading();

        try {
            // Collect form data
            const formData = FormHandlers.collectFormData();

            // Extract keywords from job description
            const jobDescription = document.getElementById('jobDescription')?.value || '';
            const keywords = KeywordExtractor.extractFromJobDescription(jobDescription);
            this.currentKeywords = keywords;

            // Generate resume
            this.generatedResume = ResumeGenerator.generateResume(formData, keywords);

            // Calculate ATS score
            const score = ATSScoring.calculateScore(this.generatedResume, keywords);

            // Update score display
            PreviewRenderer.updateScoreDisplay(score);

            // Get skill suggestions
            const currentSkills = (formData.technicalSkills + ' ' + formData.softSkills).split(',').map(s => s.trim());
            const suggestions = KeywordExtractor.getSuggestions(currentSkills, keywords);
            PreviewRenderer.updateSuggestions(suggestions);

            // Enable export buttons
            document.getElementById('exportPDF')?.removeAttribute('disabled');
            document.getElementById('exportDOCX')?.removeAttribute('disabled');

            // Render preview and show modal
            PreviewRenderer.render(this.generatedResume, keywords);

            // Small delay to ensure rendering is complete
            await this.delay(500);

            PreviewRenderer.showModal();
            this.showToast('Resume generated successfully!', 'success');

        } catch (error) {
            console.error('Error generating resume:', error);
            this.showToast('Error generating resume. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    },

    // Initialize optimize button
    initOptimizeButton() {
        const optimizeBtn = document.getElementById('optimizeResume');
        const regenerateBtn = document.getElementById('regenerateResume');

        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => this.optimizeResume());
        }

        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => this.regenerateResume());
        }
    },

    // Optimize existing resume
    async optimizeResume() {
        let existingResume = document.getElementById('existingResume')?.value;
        const targetJob = document.getElementById('targetJobDescription')?.value;

        // Check if we have a parsed resume from file upload as a fallback
        let parsedResume = null;
        if ((!existingResume || existingResume.length < 100) && window.FileUpload && window.FileUpload.getParsedResume()) {
            parsedResume = window.FileUpload.getParsedResume();
            if (parsedResume && parsedResume.rawText) {
                existingResume = parsedResume.rawText;
                // Sync to textarea if it was empty
                const textarea = document.getElementById('existingResume');
                if (textarea) textarea.value = existingResume;
            }
        }

        if (!existingResume || existingResume.trim().length < 100) {
            this.showToast('Please paste your existing resume or upload a file (at least 100 characters)', 'error');
            return;
        }

        if (!targetJob || targetJob.trim().length < 50) {
            this.showToast('Please paste the target job description', 'error');
            return;
        }

        this.showLoading();

        try {
            // Parse existing resume if we don't have it yet
            if (!parsedResume) {
                parsedResume = ResumeOptimizer.parseResumeText(existingResume);
            }

            if (!parsedResume) {
                throw new Error('Could not parse resume');
            }

            // Extract keywords from job description
            const keywords = KeywordExtractor.extractFromJobDescription(targetJob);
            this.currentKeywords = keywords;

            // Calculate before score
            const beforeScore = ATSScoring.calculateScore(parsedResume, keywords);

            // Optimize resume
            this.optimizedResume = ResumeOptimizer.optimizeResume(parsedResume, keywords);

            // Calculate after score
            const afterScore = ATSScoring.calculateScore(this.optimizedResume, keywords);

            // Update displays
            PreviewRenderer.updateAnalysisScores(beforeScore.overall, afterScore.overall);
            PreviewRenderer.updateChangesDisplay(this.optimizedResume.changes || []);

            // Find missing keywords
            const resumeText = ATSScoring.getFullResumeText(this.optimizedResume);
            const { missing } = KeywordExtractor.findMatches(resumeText, keywords);
            PreviewRenderer.updateMissingDisplay(missing);

            // Enable buttons
            document.getElementById('regenerateResume')?.removeAttribute('disabled');
            document.getElementById('exportOptimizedPDF')?.removeAttribute('disabled');
            document.getElementById('exportOptimizedDOCX')?.removeAttribute('disabled');

            // Render preview and show modal
            PreviewRenderer.render(this.optimizedResume, keywords);

            await this.delay(500);

            PreviewRenderer.showModal();
            this.showToast(`Resume optimized! Score improved from ${beforeScore.overall} to ${afterScore.overall}`, 'success');

        } catch (error) {
            console.error('Error optimizing resume:', error);
            this.showToast('Error optimizing resume. Please check your input.', 'error');
        } finally {
            this.hideLoading();
        }
    },

    // Regenerate a new version of optimized resume
    async regenerateResume() {
        if (!this.optimizedResume) {
            this.showToast('Please optimize a resume first', 'error');
            return;
        }

        this.showLoading();

        try {
            // Create a variation
            const variations = ResumeGenerator.generateVariations(
                this.optimizedResume,
                this.currentKeywords,
                1
            );

            if (variations.length > 0) {
                this.optimizedResume = variations[0];

                // Recalculate score
                const score = ATSScoring.calculateScore(this.optimizedResume, this.currentKeywords);

                // Update display
                const afterScoreEl = document.getElementById('afterScore');
                if (afterScoreEl) {
                    afterScoreEl.textContent = score.overall;
                }

                // Render new version
                PreviewRenderer.render(this.optimizedResume, this.currentKeywords);
                PreviewRenderer.showModal();

                this.showToast('New version generated!', 'success');
            }

        } catch (error) {
            console.error('Error regenerating resume:', error);
            this.showToast('Error regenerating resume.', 'error');
        } finally {
            this.hideLoading();
        }
    },

    // Initialize export buttons
    initExportButtons() {
        // Create mode exports
        document.getElementById('exportPDF')?.addEventListener('click', () => {
            this.exportPDF(this.generatedResume);
        });

        document.getElementById('exportDOCX')?.addEventListener('click', () => {
            this.exportDOCX(this.generatedResume);
        });

        // Optimize mode exports
        document.getElementById('exportOptimizedPDF')?.addEventListener('click', () => {
            this.exportPDF(this.optimizedResume);
        });

        document.getElementById('exportOptimizedDOCX')?.addEventListener('click', () => {
            this.exportDOCX(this.optimizedResume);
        });

        // Modal exports
        document.getElementById('modalExportPDF')?.addEventListener('click', () => {
            const resume = this.currentMode === 'create' ? this.generatedResume : this.optimizedResume;
            this.exportPDF(resume);
        });

        document.getElementById('modalExportDOCX')?.addEventListener('click', () => {
            const resume = this.currentMode === 'create' ? this.generatedResume : this.optimizedResume;
            this.exportDOCX(resume);
        });
    },

    // Export to PDF
    async exportPDF(resumeData) {
        if (!resumeData) {
            this.showToast('No resume to export', 'error');
            return;
        }

        try {
            await ExportPDF.generatePDF(resumeData);
            this.showToast('PDF export started. Check your print dialog.', 'success');
        } catch (error) {
            console.error('PDF export error:', error);
            this.showToast('Error exporting PDF. Please try again.', 'error');
        }
    },

    // Export to DOCX
    async exportDOCX(resumeData) {
        if (!resumeData) {
            this.showToast('No resume to export', 'error');
            return;
        }

        try {
            await ExportDOCX.generateDOCX(resumeData);
            this.showToast('DOCX file downloaded!', 'success');
        } catch (error) {
            console.error('DOCX export error:', error);
            this.showToast('Error exporting DOCX. Please try again.', 'error');
        }
    },

    // Initialize editor modal
    initEditorModal() {
        const editorModal = document.getElementById('editorModal');
        const closeEditor = document.getElementById('closeEditor');
        const cancelEdit = document.getElementById('cancelEdit');
        const saveEdit = document.getElementById('saveEdit');
        const backdrop = editorModal?.querySelector('.modal-backdrop');

        if (closeEditor) {
            closeEditor.addEventListener('click', () => this.closeEditorModal());
        }

        if (cancelEdit) {
            cancelEdit.addEventListener('click', () => this.closeEditorModal());
        }

        if (saveEdit) {
            saveEdit.addEventListener('click', () => this.saveEditorChanges());
        }

        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeEditorModal());
        }

        // Tab switching
        const tabBtns = editorModal?.querySelectorAll('.tab-btn');
        tabBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchEditorTab(tab);
            });
        });
    },

    // Initialize template and theme handlers
    initTemplateHandlers() {
        // Template Selection
        const templateSelect = document.getElementById('templateSelect');
        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => {
                const templateId = e.target.value;
                const resume = this.currentMode === 'create' ? this.generatedResume : this.optimizedResume;
                if (resume) {
                    PreviewRenderer.render(resume, this.currentKeywords, templateId);
                }
            });
        }

        // Color Presets
        const colorPresets = document.querySelectorAll('.color-preset');
        colorPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                PreviewRenderer.applyColors({ primary: color });

                // Update active state
                colorPresets.forEach(p => p.classList.remove('active'));
                preset.classList.add('active');

                // Sync custom color input
                const customColor = document.getElementById('customColor');
                if (customColor) customColor.value = color;
            });
        });

        // Custom Color Input
        const customColor = document.getElementById('customColor');
        if (customColor) {
            customColor.addEventListener('input', (e) => {
                const color = e.target.value;
                PreviewRenderer.applyColors({ primary: color });

                // Remove active class from presets
                colorPresets.forEach(p => p.classList.remove('active'));
            });
        }

        // Font Selection
        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                const font = e.target.value;
                PreviewRenderer.applyFonts({ header: font, body: font });
            });
        }
    },

    // Open editor modal
    openEditorModal() {
        const modal = document.getElementById('editorModal');
        if (!modal) return;

        const resume = this.currentMode === 'create' ? this.generatedResume : this.optimizedResume;
        if (!resume) return;

        // Populate editor fields
        document.getElementById('editSummary').value = resume.summary || '';
        document.getElementById('editTechnicalSkills').value = resume.technicalSkills || '';
        document.getElementById('editSoftSkills').value = resume.softSkills || '';
        document.getElementById('editTools').value = resume.tools || '';

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    // Close editor modal
    closeEditorModal() {
        const modal = document.getElementById('editorModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    // Switch editor tab
    switchEditorTab(tabId) {
        const tabs = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
        document.getElementById(`tab-${tabId}`)?.classList.add('active');
    },

    // Save editor changes
    saveEditorChanges() {
        const resume = this.currentMode === 'create' ? this.generatedResume : this.optimizedResume;
        if (!resume) return;

        // Update resume data
        resume.summary = document.getElementById('editSummary')?.value || resume.summary;
        resume.technicalSkills = document.getElementById('editTechnicalSkills')?.value || resume.technicalSkills;
        resume.softSkills = document.getElementById('editSoftSkills')?.value || resume.softSkills;
        resume.tools = document.getElementById('editTools')?.value || resume.tools;

        // Recalculate score
        const score = ATSScoring.calculateScore(resume, this.currentKeywords);
        PreviewRenderer.updateScoreDisplay(score);

        // Re-render preview
        PreviewRenderer.render(resume, this.currentKeywords);

        this.closeEditorModal();
        PreviewRenderer.showModal();
        this.showToast('Changes saved!', 'success');
    },

    // Add SVG gradient definitions
    addSVGDefs() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '0');
        svg.setAttribute('height', '0');
        svg.style.position = 'absolute';

        svg.innerHTML = `
            <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#6366f1"/>
                    <stop offset="100%" stop-color="#8b5cf6"/>
                </linearGradient>
            </defs>
        `;

        document.body.insertBefore(svg, document.body.firstChild);
    },

    // Show loading overlay
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    },

    // Hide loading overlay
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;">
                ${type === 'success' ? '<path d="M20 6L9 17l-5-5"/>' :
                type === 'error' ? '<path d="M18 6L6 18M6 6l12 12"/>' :
                    '<path d="M12 8v4m0 4h.01"/>'}
            </svg>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Make available globally
window.App = App;
