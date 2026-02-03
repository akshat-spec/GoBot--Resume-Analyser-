/**
 * GoBot - Keyword Extractor
 * Extracts relevant keywords from job descriptions for ATS optimization
 */

const KeywordExtractor = {
    // Common technical skills by category
    technicalSkillsDB: {
        programming: ['javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'typescript', 'scala', 'r', 'matlab', 'perl', 'html', 'css', 'sql', 'nosql', 'graphql'],
        frameworks: ['react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'rails', 'laravel', '.net', 'asp.net', 'next.js', 'nuxt', 'gatsby', 'svelte', 'bootstrap', 'tailwind', 'jquery', 'redux', 'mobx'],
        databases: ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sql server', 'sqlite', 'dynamodb', 'cassandra', 'firebase', 'supabase', 'mariadb'],
        cloud: ['aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digitalocean', 'cloudflare', 'vercel', 'netlify', 'kubernetes', 'docker', 'terraform', 'ansible', 'jenkins', 'circleci', 'github actions'],
        tools: ['git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'vscode', 'intellij', 'postman', 'swagger', 'webpack', 'babel', 'npm', 'yarn'],
        data: ['machine learning', 'deep learning', 'artificial intelligence', 'ai', 'ml', 'data science', 'data analysis', 'data engineering', 'big data', 'hadoop', 'spark', 'tableau', 'power bi', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'nlp', 'computer vision'],
        methodologies: ['agile', 'scrum', 'kanban', 'waterfall', 'devops', 'ci/cd', 'tdd', 'bdd', 'microservices', 'rest', 'api', 'soap', 'graphql', 'oauth', 'jwt']
    },

    // Common soft skills
    softSkillsDB: [
        'leadership', 'communication', 'teamwork', 'collaboration', 'problem-solving', 'problem solving',
        'critical thinking', 'analytical', 'creative', 'creativity', 'adaptable', 'adaptability',
        'time management', 'organized', 'organization', 'detail-oriented', 'attention to detail',
        'self-motivated', 'motivated', 'proactive', 'initiative', 'interpersonal', 'presentation',
        'negotiation', 'conflict resolution', 'decision-making', 'strategic thinking', 'mentoring',
        'coaching', 'customer service', 'client-facing', 'stakeholder management', 'cross-functional'
    ],

    // Action verbs for ATS
    actionVerbs: [
        'achieved', 'accelerated', 'accomplished', 'administered', 'advanced', 'analyzed', 'architected',
        'automated', 'built', 'collaborated', 'conceptualized', 'configured', 'consolidated', 'coordinated',
        'created', 'decreased', 'delivered', 'deployed', 'designed', 'developed', 'directed', 'drove',
        'enabled', 'engineered', 'enhanced', 'established', 'executed', 'expanded', 'facilitated',
        'generated', 'grew', 'guided', 'identified', 'implemented', 'improved', 'increased', 'initiated',
        'innovated', 'integrated', 'launched', 'led', 'leveraged', 'managed', 'mentored', 'migrated',
        'modernized', 'monitored', 'negotiated', 'optimized', 'orchestrated', 'organized', 'oversaw',
        'partnered', 'pioneered', 'planned', 'presented', 'prioritized', 'produced', 'programmed',
        'reduced', 'refactored', 'redesigned', 'reengineered', 'resolved', 'restructured', 'revamped',
        'scaled', 'simplified', 'spearheaded', 'standardized', 'streamlined', 'strengthened', 'supervised',
        'tested', 'trained', 'transformed', 'troubleshot', 'unified', 'upgraded'
    ],

    // Extract keywords from job description
    extractFromJobDescription(jobDescription) {
        if (!jobDescription || typeof jobDescription !== 'string') {
            return { technical: [], soft: [], requirements: [], experience: [], education: [] };
        }

        const text = jobDescription.toLowerCase();
        const words = text.split(/[\s,;:()\[\]{}\/\\|]+/).filter(w => w.length > 2);
        
        const extracted = {
            technical: [],
            soft: [],
            requirements: [],
            experience: [],
            education: [],
            all: []
        };

        // Extract technical skills
        for (const [category, skills] of Object.entries(this.technicalSkillsDB)) {
            for (const skill of skills) {
                if (text.includes(skill.toLowerCase())) {
                    const normalized = this.normalizeSkill(skill);
                    if (!extracted.technical.find(s => s.toLowerCase() === normalized.toLowerCase())) {
                        extracted.technical.push(normalized);
                    }
                }
            }
        }

        // Extract soft skills
        for (const skill of this.softSkillsDB) {
            if (text.includes(skill.toLowerCase())) {
                const normalized = this.normalizeSkill(skill);
                if (!extracted.soft.find(s => s.toLowerCase() === normalized.toLowerCase())) {
                    extracted.soft.push(normalized);
                }
            }
        }

        // Extract years of experience requirements
        const expPatterns = [
            /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi,
            /(?:experience|exp)\s*(?:of\s*)?(\d+)\+?\s*(?:years?|yrs?)/gi,
            /(\d+)-(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi
        ];

        for (const pattern of expPatterns) {
            let match;
            while ((match = pattern.exec(jobDescription)) !== null) {
                extracted.experience.push(match[0]);
            }
        }

        // Extract education requirements
        const educationPatterns = [
            /bachelor'?s?\s*(?:degree)?(?:\s*in\s*[\w\s]+)?/gi,
            /master'?s?\s*(?:degree)?(?:\s*in\s*[\w\s]+)?/gi,
            /ph\.?d\.?(?:\s*in\s*[\w\s]+)?/gi,
            /b\.?s\.?\s*(?:in\s*[\w\s]+)?/gi,
            /m\.?s\.?\s*(?:in\s*[\w\s]+)?/gi,
            /mba/gi,
            /computer science/gi,
            /software engineering/gi,
            /information technology/gi,
            /related field/gi
        ];

        for (const pattern of educationPatterns) {
            let match;
            while ((match = pattern.exec(jobDescription)) !== null) {
                const cleaned = match[0].trim();
                if (!extracted.education.find(e => e.toLowerCase() === cleaned.toLowerCase())) {
                    extracted.education.push(cleaned);
                }
            }
        }

        // Extract specific requirements (certifications, clearances, etc.)
        const requirementPatterns = [
            /certified\s+[\w\s]+/gi,
            /certification\s+(?:in\s+)?[\w\s]+/gi,
            /clearance/gi,
            /security\s+clearance/gi,
            /aws\s+certified/gi,
            /pmp/gi,
            /scrum\s+master/gi,
            /cissp/gi
        ];

        for (const pattern of requirementPatterns) {
            let match;
            while ((match = pattern.exec(jobDescription)) !== null) {
                const cleaned = match[0].trim();
                if (!extracted.requirements.find(r => r.toLowerCase() === cleaned.toLowerCase())) {
                    extracted.requirements.push(cleaned);
                }
            }
        }

        // Combine all keywords for overall matching
        extracted.all = [
            ...extracted.technical,
            ...extracted.soft,
            ...extracted.requirements
        ].filter((v, i, a) => a.indexOf(v) === i);

        return extracted;
    },

    // Normalize skill names for display
    normalizeSkill(skill) {
        const specialCases = {
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'node.js': 'Node.js',
            'react': 'React',
            'angular': 'Angular',
            'vue': 'Vue.js',
            'next.js': 'Next.js',
            'mongodb': 'MongoDB',
            'postgresql': 'PostgreSQL',
            'mysql': 'MySQL',
            'nosql': 'NoSQL',
            'aws': 'AWS',
            'gcp': 'GCP',
            'azure': 'Azure',
            'docker': 'Docker',
            'kubernetes': 'Kubernetes',
            'ci/cd': 'CI/CD',
            'rest': 'REST',
            'api': 'API',
            'sql': 'SQL',
            'html': 'HTML',
            'css': 'CSS',
            'git': 'Git',
            'ai': 'AI',
            'ml': 'ML',
            'devops': 'DevOps',
            'graphql': 'GraphQL',
            'oauth': 'OAuth',
            'jwt': 'JWT'
        };

        const lower = skill.toLowerCase();
        if (specialCases[lower]) {
            return specialCases[lower];
        }

        // Title case for multi-word skills
        return skill.split(/[\s-]+/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    },

    // Find matching keywords between resume and job description
    findMatches(resumeText, jobKeywords) {
        if (!resumeText || !jobKeywords) {
            return { matched: [], missing: [] };
        }

        const resumeLower = resumeText.toLowerCase();
        const matched = [];
        const missing = [];

        for (const keyword of jobKeywords.all || []) {
            if (resumeLower.includes(keyword.toLowerCase())) {
                matched.push(keyword);
            } else {
                missing.push(keyword);
            }
        }

        return { matched, missing };
    },

    // Get skill suggestions based on job description
    getSuggestions(resumeSkills, jobKeywords) {
        const suggestions = [];
        const resumeSkillsLower = (resumeSkills || []).map(s => s.toLowerCase());

        for (const skill of [...(jobKeywords.technical || []), ...(jobKeywords.soft || [])]) {
            if (!resumeSkillsLower.includes(skill.toLowerCase())) {
                suggestions.push({
                    skill: skill,
                    type: jobKeywords.technical?.includes(skill) ? 'technical' : 'soft',
                    priority: 'high'
                });
            }
        }

        return suggestions.slice(0, 10); // Return top 10 suggestions
    }
};

// Make available globally
window.KeywordExtractor = KeywordExtractor;
