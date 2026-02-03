/**
 * GoBot - API Client
 * Connects frontend to Python Flask backend
 */

const API = {
    baseUrl: 'http://localhost:5000/api',

    // Check if backend is available
    async isBackendAvailable() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                mode: 'cors'
            });
            return response.ok;
        } catch (e) {
            return false;
        }
    },

    // Extract keywords from job description
    async extractKeywords(jobDescription) {
        try {
            const response = await fetch(`${this.baseUrl}/extract-keywords`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobDescription })
            });
            const data = await response.json();
            return data.success ? data.keywords : null;
        } catch (e) {
            console.warn('Backend not available, using JS fallback');
            return KeywordExtractor.extractFromJobDescription(jobDescription);
        }
    },

    // Calculate ATS score
    async calculateScore(resumeData, jobKeywords) {
        try {
            const response = await fetch(`${this.baseUrl}/calculate-score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData, jobKeywords })
            });
            const data = await response.json();
            return data.success ? data.score : null;
        } catch (e) {
            console.warn('Backend not available, using JS fallback');
            return ATSScoring.calculateScore(resumeData, jobKeywords);
        }
    },

    // Optimize resume
    async optimizeResume(resumeData, jobKeywords) {
        try {
            const response = await fetch(`${this.baseUrl}/optimize-resume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData, jobKeywords })
            });
            const data = await response.json();
            return data.success ? data : null;
        } catch (e) {
            console.warn('Backend not available, using JS fallback');
            const optimized = ResumeOptimizer.optimizeResume(resumeData, jobKeywords);
            const score = ATSScoring.calculateScore(optimized, jobKeywords);
            return { optimizedResume: optimized, score };
        }
    },

    // Upload and parse resume file
    async uploadResume(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.baseUrl}/upload-resume`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Upload failed');
            }

            return data.parsedResume;
        } catch (e) {
            throw new Error(e.message || 'Failed to upload resume. Is the server running?');
        }
    },

    // Parse resume from text
    async parseText(text) {
        try {
            const response = await fetch(`${this.baseUrl}/parse-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            return data.success ? data.parsedResume : null;
        } catch (e) {
            console.warn('Backend not available, using JS fallback');
            return ResumeOptimizer.parseResumeText(text);
        }
    },

    // Get skill suggestions
    async getSuggestions(resumeSkills, jobKeywords) {
        try {
            const response = await fetch(`${this.baseUrl}/suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeSkills, jobKeywords })
            });
            const data = await response.json();
            return data.success ? data.suggestions : [];
        } catch (e) {
            console.warn('Backend not available, using JS fallback');
            return KeywordExtractor.getSuggestions(resumeSkills, jobKeywords);
        }
    }
};

// Make available globally
window.API = API;
