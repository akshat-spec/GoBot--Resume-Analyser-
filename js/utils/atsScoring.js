/**
 * GoBot - ATS Scoring Algorithm
 * Calculates ATS compatibility score for resumes
 */

const ATSScoring = {
    // Weight configuration for different scoring factors
    weights: {
        keywords: 0.35,      // Keyword matching is most important
        format: 0.25,        // Proper formatting
        content: 0.25,       // Content quality (bullet points, action verbs)
        completeness: 0.15   // All sections filled
    },

    // Calculate overall ATS score
    calculateScore(resumeData, jobKeywords) {
        const scores = {
            keywords: this.calculateKeywordScore(resumeData, jobKeywords),
            format: this.calculateFormatScore(resumeData),
            content: this.calculateContentScore(resumeData),
            completeness: this.calculateCompletenessScore(resumeData)
        };

        // Calculate weighted average
        const overall = Math.round(
            scores.keywords * this.weights.keywords +
            scores.format * this.weights.format +
            scores.content * this.weights.content +
            scores.completeness * this.weights.completeness
        );

        return {
            overall: Math.min(100, Math.max(0, overall)),
            breakdown: scores,
            tips: this.generateTips(scores, resumeData, jobKeywords)
        };
    },

    // Calculate keyword matching score
    calculateKeywordScore(resumeData, jobKeywords) {
        if (!jobKeywords || !jobKeywords.all || jobKeywords.all.length === 0) {
            return 70; // Default score when no job description provided
        }

        const resumeText = this.getFullResumeText(resumeData).toLowerCase();
        let matchedCount = 0;

        for (const keyword of jobKeywords.all) {
            if (resumeText.includes(keyword.toLowerCase())) {
                matchedCount++;
            }
        }

        const matchPercentage = (matchedCount / jobKeywords.all.length) * 100;

        // Scale: 0-30% match = poor, 30-60% = average, 60-80% = good, 80%+ = excellent
        if (matchPercentage >= 80) return 95;
        if (matchPercentage >= 60) return 75 + (matchPercentage - 60) * 1;
        if (matchPercentage >= 30) return 50 + (matchPercentage - 30) * 0.83;
        return matchPercentage * 1.67;
    },

    // Calculate format score
    calculateFormatScore(resumeData) {
        let score = 100;
        const deductions = [];

        // Check for proper contact information
        if (!resumeData.fullName) {
            score -= 15;
            deductions.push('missing_name');
        }
        if (!resumeData.email) {
            score -= 15;
            deductions.push('missing_email');
        }
        if (!resumeData.phone) {
            score -= 5;
            deductions.push('missing_phone');
        }

        // Check for proper section structure
        if (!resumeData.experience || resumeData.experience.length === 0) {
            score -= 10;
            deductions.push('missing_experience');
        }

        // Check for consistent date formatting
        const hasInconsistentDates = this.checkDateConsistency(resumeData);
        if (hasInconsistentDates) {
            score -= 10;
            deductions.push('inconsistent_dates');
        }

        return Math.max(0, score);
    },

    // Calculate content quality score
    calculateContentScore(resumeData) {
        let score = 0;
        let totalBullets = 0;
        let goodBullets = 0;

        // Check bullet points in experience
        if (resumeData.experience) {
            for (const exp of resumeData.experience) {
                if (exp.bullets) {
                    for (const bullet of exp.bullets) {
                        totalBullets++;
                        if (this.isGoodBulletPoint(bullet)) {
                            goodBullets++;
                        }
                    }
                }
            }
        }

        // Calculate bullet quality score
        if (totalBullets > 0) {
            score += (goodBullets / totalBullets) * 60;
        } else {
            score += 30; // Penalty for no bullets
        }

        // Check summary quality
        if (resumeData.summary) {
            const summaryLength = resumeData.summary.length;
            if (summaryLength >= 100 && summaryLength <= 500) {
                score += 20;
            } else if (summaryLength > 50) {
                score += 10;
            }
        }

        // Check skills presence
        const hasSkills = resumeData.technicalSkills || resumeData.softSkills || resumeData.tools;
        if (hasSkills) {
            score += 20;
        }

        return Math.min(100, score);
    },

    // Calculate completeness score
    calculateCompletenessScore(resumeData) {
        const sections = [
            { key: 'fullName', weight: 15 },
            { key: 'email', weight: 15 },
            { key: 'phone', weight: 5 },
            { key: 'summary', weight: 15 },
            { key: 'experience', weight: 20 },
            { key: 'education', weight: 15 },
            { key: 'technicalSkills', weight: 10 },
            { key: 'projects', weight: 5 }
        ];

        let score = 0;
        for (const section of sections) {
            const value = resumeData[section.key];
            if (value && (typeof value === 'string' ? value.trim() : value.length > 0)) {
                score += section.weight;
            }
        }

        return score;
    },

    // Check if bullet point follows best practices
    isGoodBulletPoint(bullet) {
        if (!bullet || bullet.length < 20) return false;

        const words = bullet.toLowerCase().split(' ');
        const firstWord = words[0];

        // Check for action verb at the start
        const hasActionVerb = KeywordExtractor.actionVerbs.some(verb =>
            firstWord.startsWith(verb.toLowerCase())
        );

        // Check for metrics/numbers
        const hasMetrics = /\d+%?|\$[\d,]+|[\d,]+\s*(users?|customers?|clients?|projects?|team)/i.test(bullet);

        // Good bullet has action verb and preferably metrics
        if (hasActionVerb && hasMetrics) return true;
        if (hasActionVerb && bullet.length > 50) return true;
        if (hasMetrics) return true;

        return false;
    },

    // Check date formatting consistency
    checkDateConsistency(resumeData) {
        const dates = [];

        if (resumeData.experience) {
            for (const exp of resumeData.experience) {
                if (exp.startDate) dates.push(exp.startDate);
                if (exp.endDate) dates.push(exp.endDate);
            }
        }

        if (resumeData.education) {
            for (const edu of resumeData.education) {
                if (edu.graduationDate) dates.push(edu.graduationDate);
            }
        }

        // Simple check - in real implementation, would validate formats
        return dates.length > 0 && dates.some(d => !d);
    },

    // Get full resume text for keyword matching
    getFullResumeText(resumeData) {
        const parts = [];

        if (resumeData.fullName) parts.push(resumeData.fullName);
        if (resumeData.summary) parts.push(resumeData.summary);
        if (resumeData.technicalSkills) parts.push(resumeData.technicalSkills);
        if (resumeData.softSkills) parts.push(resumeData.softSkills);
        if (resumeData.tools) parts.push(resumeData.tools);

        if (resumeData.experience) {
            for (const exp of resumeData.experience) {
                if (exp.title) parts.push(exp.title);
                if (exp.company) parts.push(exp.company);
                if (exp.bullets) parts.push(exp.bullets.join(' '));
            }
        }

        if (resumeData.education) {
            for (const edu of resumeData.education) {
                if (edu.degree) parts.push(edu.degree);
                if (edu.school) parts.push(edu.school);
                if (edu.field) parts.push(edu.field);
            }
        }

        if (resumeData.projects) {
            for (const proj of resumeData.projects) {
                if (proj.name) parts.push(proj.name);
                if (proj.description) parts.push(proj.description);
                if (proj.technologies) parts.push(proj.technologies);
            }
        }

        if (resumeData.certifications) {
            for (const cert of resumeData.certifications) {
                if (cert.name) parts.push(cert.name);
                if (cert.issuer) parts.push(cert.issuer);
            }
        }

        return parts.join(' ');
    },

    // Generate improvement tips
    generateTips(scores, resumeData, jobKeywords) {
        const tips = [];

        // Keyword tips
        if (scores.keywords < 60) {
            tips.push({
                type: 'keywords',
                priority: 'high',
                text: 'Add more keywords from the job description to improve ATS matching'
            });
        }

        // Format tips
        if (!resumeData.phone) {
            tips.push({
                type: 'format',
                priority: 'medium',
                text: 'Add a phone number to your contact information'
            });
        }
        if (!resumeData.linkedin && !resumeData.portfolio) {
            tips.push({
                type: 'format',
                priority: 'low',
                text: 'Consider adding LinkedIn or portfolio links'
            });
        }

        // Content tips
        if (scores.content < 70) {
            tips.push({
                type: 'content',
                priority: 'high',
                text: 'Start bullet points with action verbs and include measurable achievements'
            });
        }

        // Summary tips
        if (!resumeData.summary || resumeData.summary.length < 50) {
            tips.push({
                type: 'content',
                priority: 'medium',
                text: 'Add a professional summary highlighting your key qualifications'
            });
        }

        // Skills tips
        if (!resumeData.technicalSkills && jobKeywords?.technical?.length > 0) {
            tips.push({
                type: 'keywords',
                priority: 'high',
                text: 'Add a dedicated skills section with relevant technical skills'
            });
        }

        // Missing keywords
        if (jobKeywords?.all) {
            const resumeText = this.getFullResumeText(resumeData).toLowerCase();
            const missing = jobKeywords.all.filter(k => !resumeText.includes(k.toLowerCase()));
            if (missing.length > 3) {
                tips.push({
                    type: 'keywords',
                    priority: 'high',
                    text: `Consider adding these missing keywords: ${missing.slice(0, 5).join(', ')}`
                });
            }
        }

        return tips.slice(0, 5); // Return top 5 tips
    },

    // Get score color based on value
    getScoreColor(score) {
        if (score >= 80) return '#10b981'; // Green
        if (score >= 60) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    },

    // Get score label
    getScoreLabel(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Great';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Fair';
        if (score >= 50) return 'Needs Work';
        return 'Poor';
    }
};

// Make available globally
window.ATSScoring = ATSScoring;
