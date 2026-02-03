/**
 * GoBot - Resume Generator
 * Generates professional resume content based on user input
 */

const ResumeGenerator = {
    // Generate a complete resume from form data
    generateResume(formData, jobKeywords) {
        const resume = {
            ...formData,
            optimized: true,
            generatedAt: new Date().toISOString()
        };

        // Enhance summary if needed
        if (!resume.summary && resume.experience?.length > 0) {
            resume.summary = this.generateSummary(formData, jobKeywords);
        }

        // Enhance bullet points
        if (resume.experience) {
            resume.experience = resume.experience.map(exp => ({
                ...exp,
                bullets: this.enhanceBullets(exp.bullets || [], jobKeywords)
            }));
        }

        return resume;
    },

    // Generate a professional summary
    generateSummary(formData, jobKeywords) {
        const parts = [];

        // Calculate years of experience
        let yearsExp = 0;
        if (formData.experience && formData.experience.length > 0) {
            const sortedExp = [...formData.experience].sort((a, b) => {
                const dateA = new Date(a.startDate || 0);
                const dateB = new Date(b.startDate || 0);
                return dateA - dateB;
            });
            const earliest = new Date(sortedExp[0]?.startDate || Date.now());
            yearsExp = Math.floor((Date.now() - earliest.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        }

        // Start with experience level
        if (yearsExp > 10) {
            parts.push('Senior-level professional');
        } else if (yearsExp > 5) {
            parts.push('Experienced professional');
        } else if (yearsExp > 2) {
            parts.push('Skilled professional');
        } else {
            parts.push('Motivated professional');
        }

        // Add years if available
        if (yearsExp > 0) {
            parts[0] += ` with ${yearsExp}+ years of experience`;
        }

        // Add key skills from job keywords
        if (jobKeywords?.technical?.length > 0) {
            const topSkills = jobKeywords.technical.slice(0, 3).join(', ');
            parts.push(`specializing in ${topSkills}`);
        } else if (formData.technicalSkills) {
            const skills = formData.technicalSkills.split(',').slice(0, 3).map(s => s.trim()).join(', ');
            if (skills) {
                parts.push(`with expertise in ${skills}`);
            }
        }

        // Add career goal or focus
        if (formData.experience?.[0]?.title) {
            parts.push(`Proven track record in ${formData.experience[0].title.toLowerCase()} roles`);
        }

        // Add soft skills if available
        if (formData.softSkills) {
            const softSkills = formData.softSkills.split(',').slice(0, 2).map(s => s.trim()).join(' and ');
            if (softSkills) {
                parts.push(`Known for strong ${softSkills.toLowerCase()}`);
            }
        }

        // Combine into summary
        let summary = parts[0];
        if (parts[1]) summary += ' ' + parts[1] + '.';
        else summary += '.';

        if (parts[2]) summary += ' ' + parts[2] + '.';
        if (parts[3]) summary += ' ' + parts[3] + '.';

        return summary;
    },

    // Enhance bullet points with action verbs and metrics
    enhanceBullets(bullets, jobKeywords) {
        if (!bullets || bullets.length === 0) return bullets;

        return bullets.map(bullet => {
            if (!bullet || bullet.trim().length === 0) return bullet;

            let enhanced = bullet.trim();

            // Check if already starts with action verb
            const words = enhanced.split(' ');
            const firstWord = words[0].toLowerCase();
            const hasActionVerb = KeywordExtractor.actionVerbs.some(verb =>
                firstWord === verb.toLowerCase() || firstWord === verb.toLowerCase() + 'd' || firstWord === verb.toLowerCase() + 'ed'
            );

            // Add action verb if missing
            if (!hasActionVerb && enhanced.length > 10) {
                const suggestedVerbs = this.suggestActionVerbs(enhanced);
                if (suggestedVerbs.length > 0) {
                    // Capitalize first letter and add verb
                    enhanced = enhanced.charAt(0).toLowerCase() + enhanced.slice(1);
                    enhanced = suggestedVerbs[0] + ' ' + enhanced;
                }
            }

            // Ensure first letter is capitalized
            enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);

            // Add period if missing
            if (!enhanced.endsWith('.') && !enhanced.endsWith('!') && !enhanced.endsWith('?')) {
                enhanced += '.';
            }

            return enhanced;
        });
    },

    // Suggest action verbs based on bullet content
    suggestActionVerbs(bulletText) {
        const text = bulletText.toLowerCase();

        // Keywords to action verb mapping
        const verbMappings = {
            'team': ['Led', 'Managed', 'Coordinated', 'Collaborated'],
            'develop': ['Developed', 'Built', 'Created', 'Engineered'],
            'design': ['Designed', 'Architected', 'Conceptualized'],
            'implement': ['Implemented', 'Deployed', 'Executed'],
            'improve': ['Improved', 'Enhanced', 'Optimized', 'Streamlined'],
            'manage': ['Managed', 'Oversaw', 'Directed', 'Supervised'],
            'create': ['Created', 'Developed', 'Built', 'Produced'],
            'analyze': ['Analyzed', 'Evaluated', 'Assessed'],
            'reduce': ['Reduced', 'Decreased', 'Minimized'],
            'increase': ['Increased', 'Grew', 'Expanded', 'Boosted'],
            'test': ['Tested', 'Validated', 'Verified'],
            'support': ['Supported', 'Assisted', 'Facilitated'],
            'train': ['Trained', 'Mentored', 'Coached'],
            'research': ['Researched', 'Investigated', 'Explored']
        };

        for (const [keyword, verbs] of Object.entries(verbMappings)) {
            if (text.includes(keyword)) {
                return verbs;
            }
        }

        // Default action verbs
        return ['Executed', 'Delivered', 'Performed', 'Accomplished'];
    },

    // Generate multiple variations of the resume
    generateVariations(formData, jobKeywords, count = 3) {
        const variations = [];

        for (let i = 0; i < count; i++) {
            const variation = this.generateResume({ ...formData }, jobKeywords);
            variation.variationIndex = i + 1;

            // Add slight variations to each version
            if (i > 0 && variation.summary) {
                variation.summary = this.createSummaryVariation(variation.summary, i);
            }

            if (i > 0 && variation.experience) {
                variation.experience = variation.experience.map(exp => ({
                    ...exp,
                    bullets: this.createBulletVariations(exp.bullets || [], i)
                }));
            }

            variations.push(variation);
        }

        return variations;
    },

    // Create a variation of the summary
    createSummaryVariation(summary, index) {
        const starters = [
            'Results-driven', 'Dynamic', 'Innovative', 'Strategic', 'Accomplished',
            'Performance-focused', 'Forward-thinking', 'Detail-oriented', 'Analytical'
        ];

        // Try to replace the first descriptor
        const words = summary.split(' ');
        if (words.length > 0) {
            const newStarter = starters[index % starters.length];
            if (words[0].endsWith('professional') || words[0].endsWith('engineer') ||
                words[0].endsWith('developer') || words[0].endsWith('manager')) {
                words.unshift(newStarter);
            } else {
                words[0] = newStarter;
            }
        }

        return words.join(' ');
    },

    // Create variations of bullet points
    createBulletVariations(bullets, index) {
        if (!bullets || bullets.length === 0) return bullets;

        return bullets.map(bullet => {
            if (!bullet) return bullet;

            const words = bullet.split(' ');
            if (words.length === 0) return bullet;

            // Alternative action verbs
            const alternatives = {
                'Developed': ['Built', 'Created', 'Engineered', 'Designed'],
                'Managed': ['Led', 'Directed', 'Oversaw', 'Supervised'],
                'Improved': ['Enhanced', 'Optimized', 'Streamlined', 'Advanced'],
                'Created': ['Developed', 'Built', 'Designed', 'Produced'],
                'Implemented': ['Deployed', 'Executed', 'Established', 'Launched'],
                'Led': ['Spearheaded', 'Directed', 'Headed', 'Championed'],
                'Collaborated': ['Partnered', 'Worked', 'Teamed', 'Cooperated']
            };

            const firstWord = words[0];
            if (alternatives[firstWord]) {
                words[0] = alternatives[firstWord][index % alternatives[firstWord].length];
            }

            return words.join(' ');
        });
    },

    // Format the resume for display
    formatForDisplay(resumeData) {
        return {
            header: {
                name: resumeData.fullName || '',
                email: resumeData.email || '',
                phone: resumeData.phone || '',
                location: resumeData.location || '',
                linkedin: resumeData.linkedin || '',
                portfolio: resumeData.portfolio || ''
            },
            summary: resumeData.summary || '',
            experience: (resumeData.experience || []).map(exp => ({
                title: exp.title || '',
                company: exp.company || '',
                location: exp.location || '',
                startDate: exp.startDate || '',
                endDate: exp.endDate || 'Present',
                bullets: exp.bullets || []
            })),
            education: (resumeData.education || []).map(edu => ({
                degree: edu.degree || '',
                school: edu.school || '',
                location: edu.location || '',
                graduationDate: edu.graduationDate || '',
                gpa: edu.gpa || '',
                field: edu.field || ''
            })),
            skills: {
                technical: resumeData.technicalSkills || '',
                soft: resumeData.softSkills || '',
                tools: resumeData.tools || ''
            },
            projects: (resumeData.projects || []).map(proj => ({
                name: proj.name || '',
                description: proj.description || '',
                technologies: proj.technologies || '',
                link: proj.link || ''
            })),
            certifications: (resumeData.certifications || []).map(cert => ({
                name: cert.name || '',
                issuer: cert.issuer || '',
                date: cert.date || ''
            }))
        };
    }
};

// Make available globally
window.ResumeGenerator = ResumeGenerator;
