/**
 * GoBot - Resume Templates Registry
 * Defines different resume styles and layouts
 */

const ResumeTemplates = {
    // Modern Template (Purple Accent)
    modern: {
        id: 'modern',
        name: 'Modern Professional',
        colors: {
            primary: '#7c3aed', // Purple
            secondary: '#4b5563',
            text: '#1f2937',
            border: '#e5e7eb'
        },
        fonts: {
            header: "'Inter', sans-serif",
            body: "'Inter', sans-serif"
        },
        layout: 'modern'
    },

    // Professional Template (Blue Accent)
    professional: {
        id: 'professional',
        name: 'Executive Elite',
        colors: {
            primary: '#2563eb', // Blue
            secondary: '#1e40af',
            text: '#111827',
            border: '#94a3b8'
        },
        fonts: {
            header: "'Georgia', serif",
            body: "'Georgia', serif"
        },
        layout: 'professional'
    },

    // ATS Optimized (Classic B&W)
    ats: {
        id: 'ats',
        name: 'ATS Standard',
        colors: {
            primary: '#000000',
            secondary: '#333333',
            text: '#000000',
            border: '#000000'
        },
        fonts: {
            header: 'Arial, sans-serif',
            body: 'Arial, sans-serif'
        },
        layout: 'ats'
    },

    // Modern ATS (Subtle Accents)
    modern_ats: {
        id: 'modern_ats',
        name: 'Modern ATS',
        colors: {
            primary: '#4f46e5', // Indigo
            secondary: '#4b5563',
            text: '#111827',
            border: '#e5e7eb'
        },
        fonts: {
            header: "'Inter', sans-serif",
            body: "'Inter', sans-serif"
        },
        layout: 'ats'
    },

    // Executive ATS (Serif)
    executive_ats: {
        id: 'executive_ats',
        name: 'Executive ATS',
        colors: {
            primary: '#1e293b', // Slate
            secondary: '#64748b',
            text: '#0f172a',
            border: '#cbd5e1'
        },
        fonts: {
            header: "'Georgia', serif",
            body: "'Times New Roman', serif"
        },
        layout: 'ats'
    },

    // Harvard Style (Clean, Traditional, ATS-Friendly)
    harvard: {
        id: 'harvard',
        name: 'Harvard Academic',
        colors: {
            primary: '#A51C30', // Harvard Crimson
            secondary: '#1f2937',
            text: '#000000',
            border: '#000000'
        },
        fonts: {
            header: "'Garamond', serif",
            body: "'Garamond', serif"
        },
        layout: 'ats'
    },

    // Google Style (Modern, Tech-Focused)
    google: {
        id: 'google',
        name: 'Google Tech',
        colors: {
            primary: '#4285F4', // Google Blue
            secondary: '#5f6368',
            text: '#202124',
            border: '#dadce0'
        },
        fonts: {
            header: "'Roboto', sans-serif",
            body: "'Roboto', sans-serif"
        },
        layout: 'modern'
    },

    // McKinsey Style (High Density, Consulting)
    mckinsey: {
        id: 'mckinsey',
        name: 'McKinsey Consulting',
        colors: {
            primary: '#003DA5', // McKinsey Blue
            secondary: '#333333',
            text: '#000000',
            border: '#000000'
        },
        fonts: {
            header: "'Arial', sans-serif",
            body: "'Times New Roman', serif"
        },
        layout: 'ats'
    },

    // Ivy League (Elegant, Professional)
    ivy_league: {
        id: 'ivy_league',
        name: 'Ivy League Professional',
        colors: {
            primary: '#004A99',
            secondary: '#444444',
            text: '#111111',
            border: '#666666'
        },
        fonts: {
            header: "'Georgia', serif",
            body: "'Georgia', serif"
        },
        layout: 'professional'
    },

    // Goldman Sachs Style (Ultra-Traditional)
    goldman_sachs: {
        id: 'goldman_sachs',
        name: 'Goldman Sparse',
        colors: {
            primary: '#1d4289', // Goldman Blue
            secondary: '#333333',
            text: '#000000',
            border: '#000000'
        },
        fonts: {
            header: "'Arial', sans-serif",
            body: "'Arial', sans-serif"
        },
        layout: 'ats'
    },

    // Minimalist
    minimal: {
        id: 'minimal',
        name: 'Minimalist Clean',
        colors: {
            primary: '#27272a',
            secondary: '#71717a',
            text: '#09090b',
            border: '#f4f4f5'
        },
        fonts: {
            header: "'Inter', sans-serif",
            body: "'Inter', sans-serif"
        },
        layout: 'minimal'
    },

    // Get template by ID
    getTemplate(id) {
        return this[id] || this.modern;
    },

    // Get all templates
    getAll() {
        return Object.values(this).filter(t => typeof t === 'object');
    }
};

// Make available globally
window.ResumeTemplates = ResumeTemplates;
