/**
 * GoBot - Resume Optimizer
 * Optimizes existing resumes for ATS compatibility
 * Enhanced version with improved parsing
 */

const ResumeOptimizer = {
    // Common section header keywords for detection
    SECTION_KEYWORDS: {
        experience: ['experience', 'work history', 'employment', 'professional experience', 'work experience', 'career history'],
        education: ['education', 'academic', 'qualifications', 'educational background'],
        skills: ['skills', 'technical skills', 'competencies', 'expertise', 'proficiencies', 'technologies'],
        summary: ['summary', 'objective', 'profile', 'professional summary', 'career objective', 'about'],
        projects: ['projects', 'personal projects', 'key projects', 'portfolio'],
        certifications: ['certifications', 'licenses', 'credentials', 'certificates', 'professional certifications']
    },

    // Parse existing resume text into structured data
    parseResumeText(resumeText) {
        if (!resumeText || typeof resumeText !== 'string') {
            return null;
        }

        const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        const parsed = {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            portfolio: '',
            summary: '',
            experience: [],
            education: [],
            technicalSkills: '',
            softSkills: '',
            tools: '',
            projects: [],
            certifications: [],
            rawText: resumeText
        };

        let currentSection = 'header';
        let headerLinesProcessed = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const nextLine = i < lines.length - 1 ? lines[i + 1] : '';

            // Detect section headers with improved detection
            const detectedSection = this.detectSectionHeader(line, nextLine);
            if (detectedSection) {
                currentSection = detectedSection;
                continue;
            }

            // Parse content based on current section
            switch (currentSection) {
                case 'header':
                    this.parseHeaderLine(line, parsed, headerLinesProcessed);
                    headerLinesProcessed++;
                    // Auto-detect when header ends (after 6 lines or when we see a section-like line)
                    if (headerLinesProcessed > 6) {
                        currentSection = 'unknown';
                    }
                    break;
                case 'summary':
                    if (parsed.summary) parsed.summary += ' ';
                    parsed.summary += line;
                    break;
                case 'experience':
                    this.parseExperienceLine(line, parsed, i, lines);
                    break;
                case 'education':
                    this.parseEducationLine(line, parsed, i, lines);
                    break;
                case 'skills':
                    this.parseSkillsLine(line, parsed);
                    break;
                case 'projects':
                    this.parseProjectLine(line, parsed);
                    break;
                case 'certifications':
                    this.parseCertificationLine(line, parsed);
                    break;
                default:
                    // Unknown section - try to auto-detect content type
                    this.parseUnknownLine(line, parsed);
                    break;
            }
        }

        // Post-processing: clean up extracted data
        this.cleanupParsedData(parsed);

        return parsed;
    },

    // Improved section header detection
    detectSectionHeader(line, nextLine = '') {
        const cleanLine = line.replace(/[:\-_=•*#]+$/g, '').trim();
        const lowerLine = cleanLine.toLowerCase();

        // Check if line length is reasonable for a header (not too long)
        if (cleanLine.length > 60) return null;

        // Check for each section type
        for (const [section, keywords] of Object.entries(this.SECTION_KEYWORDS)) {
            for (const keyword of keywords) {
                // Exact match or starts with keyword
                if (lowerLine === keyword ||
                    lowerLine.startsWith(keyword + ':') ||
                    lowerLine.startsWith(keyword + ' ') ||
                    lowerLine.endsWith(' ' + keyword)) {
                    return section;
                }

                // Check for ALL CAPS version
                if (line.toUpperCase() === line && lowerLine.includes(keyword)) {
                    return section;
                }

                // Check for Title Case with colon
                if (/^[A-Z]/.test(line) && lowerLine.includes(keyword) &&
                    (line.endsWith(':') || line.endsWith('-') || nextLine.startsWith('-') || nextLine.startsWith('='))) {
                    return section;
                }
            }
        }

        // Check for standalone section-like headers
        if (line.length < 30 && (
            line === line.toUpperCase() ||
            line.endsWith(':') ||
            /^[A-Z][A-Z\s]+$/.test(line)
        )) {
            // Try to match partial keywords
            if (lowerLine.includes('work') || lowerLine.includes('employ')) return 'experience';
            if (lowerLine.includes('school') || lowerLine.includes('degree')) return 'education';
            if (lowerLine.includes('skill') || lowerLine.includes('tech')) return 'skills';
        }

        return null;
    },

    // Parse header line for contact info with improved extraction
    parseHeaderLine(line, parsed, lineIndex) {
        // Remove common separators for parsing
        const cleanLine = line.replace(/\s*[|•·]\s*/g, ' ').trim();

        // Extract email
        const emailMatch = line.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch && !parsed.email) {
            parsed.email = emailMatch[0];
        }

        // Extract phone (various formats)
        const phonePatterns = [
            /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
            /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
            /\d{10,}/
        ];
        for (const pattern of phonePatterns) {
            const phoneMatch = line.match(pattern);
            if (phoneMatch && !parsed.phone) {
                parsed.phone = phoneMatch[0].trim();
                break;
            }
        }

        // Extract LinkedIn URL
        const linkedinMatch = line.match(/linkedin\.com\/in\/[\w-]+/i);
        if (linkedinMatch && !parsed.linkedin) {
            parsed.linkedin = linkedinMatch[0];
        }

        // Extract portfolio/website
        const websiteMatch = line.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[\w-]*)?/i);
        if (websiteMatch && !websiteMatch[0].includes('linkedin') && !websiteMatch[0].includes('@') && !parsed.portfolio) {
            parsed.portfolio = websiteMatch[0];
        }

        // Extract location (City, State pattern)
        const locationMatch = line.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/);
        if (locationMatch && !parsed.location) {
            parsed.location = locationMatch[0];
        }

        // First line without contact info is likely the name
        if (lineIndex === 0 && !parsed.fullName) {
            // Remove contact info to get clean name
            let potentialName = line
                .replace(/[\w.-]+@[\w.-]+\.\w+/g, '')
                .replace(/\+?\d[\d\s\-()]+/g, '')
                .replace(/linkedin\.com\/\S+/gi, '')
                .replace(/[|•·]/g, '')
                .trim();

            if (potentialName.length > 2 && potentialName.length < 50 && /^[A-Za-z\s]+$/.test(potentialName)) {
                parsed.fullName = potentialName;
            }
        }

        // Try to extract name from second line if first line was all contact info
        if (lineIndex === 1 && !parsed.fullName && line.length > 2 && line.length < 50) {
            if (/^[A-Za-z\s]+$/.test(line) && !line.includes('@')) {
                parsed.fullName = line;
            }
        }
    },

    // Parse experience lines with improved job detection
    parseExperienceLine(line, parsed, index, allLines) {
        // Check for bullet points
        if (/^[•\-\*▪◦○]\s*/.test(line) || /^\d+[.)]\s*/.test(line)) {
            const bulletText = line.replace(/^[•\-\*▪◦○]\s*/, '').replace(/^\d+[.)]\s*/, '');
            if (parsed.experience.length > 0 && bulletText.length > 5) {
                const lastExp = parsed.experience[parsed.experience.length - 1];
                if (!lastExp.bullets) lastExp.bullets = [];
                lastExp.bullets.push(bulletText);
            }
            return;
        }

        // Extended date patterns
        const datePatterns = [
            /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|Present|Current|Now)/i,
            /(\d{1,2}\/\d{4})\s*[-–—to]+\s*(\d{1,2}\/\d{4}|Present|Current|Now)/i,
            /(\d{4})\s*[-–—to]+\s*(\d{4}|Present|Current|Now)/i,
            /(\b\d{4}\b).*?[-–—]\s*(Present|Current|Now|\d{4})/i
        ];

        let dateMatch = null;
        for (const pattern of datePatterns) {
            dateMatch = line.match(pattern);
            if (dateMatch) break;
        }

        // Check if this looks like a job entry (has title keywords or date)
        if (dateMatch || this.looksLikeJobTitle(line)) {
            const newExp = {
                title: '',
                company: '',
                location: '',
                startDate: dateMatch ? dateMatch[1] : '',
                endDate: dateMatch ? dateMatch[2] : '',
                bullets: []
            };

            // Remove date from line for parsing title/company
            let cleanedLine = line;
            if (dateMatch) {
                cleanedLine = line.replace(dateMatch[0], '').trim();
            }

            // Try different separator patterns
            const separators = [/\s*\|\s*/, /\s+at\s+/i, /\s*,\s*/, /\s*@\s*/, /\s+-\s+/];
            let parts = [];

            for (const sep of separators) {
                parts = cleanedLine.split(sep).filter(p => p.length > 0);
                if (parts.length >= 2) break;
            }

            if (parts.length >= 3) {
                newExp.title = parts[0].trim();
                newExp.company = parts[1].trim();
                newExp.location = parts[2].trim();
            } else if (parts.length === 2) {
                newExp.title = parts[0].trim();
                newExp.company = parts[1].trim();
            } else if (parts.length === 1) {
                // Single part - determine if it's title or company
                if (this.looksLikeJobTitle(parts[0])) {
                    newExp.title = parts[0].trim();
                } else {
                    newExp.company = parts[0].trim();
                }
            }

            // Only add if we got meaningful data
            if (newExp.title || newExp.company) {
                parsed.experience.push(newExp);
            }
        }
    },

    // Enhanced job title detection
    looksLikeJobTitle(line) {
        const titleKeywords = [
            'engineer', 'developer', 'manager', 'director', 'analyst',
            'designer', 'architect', 'lead', 'senior', 'junior', 'intern',
            'specialist', 'coordinator', 'consultant', 'administrator',
            'executive', 'associate', 'assistant', 'supervisor', 'head',
            'officer', 'chief', 'vice president', 'vp', 'founder', 'co-founder',
            'scientist', 'researcher', 'professor', 'instructor', 'teacher',
            'technician', 'support', 'representative', 'sales', 'marketing',
            'product', 'project', 'program', 'software', 'hardware', 'data',
            'qa', 'quality', 'devops', 'sre', 'full stack', 'frontend', 'backend'
        ];
        const lower = line.toLowerCase();
        return titleKeywords.some(kw => lower.includes(kw));
    },

    // Parse education lines with improved extraction
    parseEducationLine(line, parsed, index, allLines) {
        const degreePatterns = [
            /\b(Bachelor'?s?|Master'?s?|Ph\.?D\.?|Doctorate|B\.?A\.?|B\.?S\.?|M\.?A\.?|M\.?S\.?|M\.?B\.?A\.?|Associate'?s?|B\.?Tech|M\.?Tech|B\.?E\.?|M\.?E\.?)\b/i,
            /\b(Bachelor|Master|Doctor)\s+of\s+\w+/i
        ];

        const schoolPatterns = [
            /\b(University|College|Institute|School|Academy)\b/i,
            /\b[A-Z][a-zA-Z\s]+(University|College|Institute|School)\b/
        ];

        // Check if line contains degree or school info
        const hasDegree = degreePatterns.some(p => p.test(line));
        const hasSchool = schoolPatterns.some(p => p.test(line));

        if (hasDegree || hasSchool) {
            const edu = {
                degree: '',
                field: '',
                school: '',
                location: '',
                graduationDate: '',
                gpa: ''
            };

            // Extract year
            const yearMatch = line.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) {
                edu.graduationDate = yearMatch[0];
            }

            // Extract GPA
            const gpaMatch = line.match(/GPA:?\s*([\d.]+)/i);
            if (gpaMatch) {
                edu.gpa = gpaMatch[1];
            }

            // Extract degree
            for (const pattern of degreePatterns) {
                const match = line.match(pattern);
                if (match) {
                    edu.degree = match[0].trim();
                    break;
                }
            }

            // Extract field of study
            const fieldMatch = line.match(/(?:in|of)\s+([A-Za-z\s]+?)(?:,|\||from|at|$)/i);
            if (fieldMatch) {
                edu.field = fieldMatch[1].trim();
            }

            // Extract school name
            const schoolMatch = line.match(/([A-Z][a-zA-Z\s]*(University|College|Institute|School|Academy)[a-zA-Z\s]*)/i);
            if (schoolMatch) {
                edu.school = schoolMatch[0].replace(/\d{4}/g, '').trim();
            }

            // Extract location
            const locationMatch = line.match(/([A-Z][a-zA-Z]+,\s*[A-Z]{2})/);
            if (locationMatch) {
                edu.location = locationMatch[0];
            }

            if (edu.degree || edu.school) {
                parsed.education.push(edu);
            }
        }
    },

    // Improved skills line parsing
    parseSkillsLine(line, parsed) {
        // Check for category labels
        const categoryPatterns = [
            { pattern: /^(?:Technical|Programming|Tech|Hard)\s*(?:Skills)?:?\s*/i, type: 'technical' },
            { pattern: /^(?:Soft|Interpersonal|Personal)\s*(?:Skills)?:?\s*/i, type: 'soft' },
            { pattern: /^(?:Tools|Technologies|Frameworks|Libraries|Platforms):?\s*/i, type: 'tools' },
            { pattern: /^(?:Languages|Programming Languages):?\s*/i, type: 'technical' },
            { pattern: /^(?:Databases?|DB):?\s*/i, type: 'technical' },
            { pattern: /^(?:Cloud|DevOps|Infrastructure):?\s*/i, type: 'technical' }
        ];

        let cleanedLine = line;
        let skillType = 'technical'; // default

        for (const { pattern, type } of categoryPatterns) {
            if (pattern.test(line)) {
                cleanedLine = line.replace(pattern, '').trim();
                skillType = type;
                break;
            }
        }

        // Remove bullet points
        cleanedLine = cleanedLine.replace(/^[•\-\*▪]\s*/, '');

        if (cleanedLine.length < 3) return;

        // Add to appropriate skill category
        switch (skillType) {
            case 'soft':
                parsed.softSkills = parsed.softSkills
                    ? parsed.softSkills + ', ' + cleanedLine
                    : cleanedLine;
                break;
            case 'tools':
                parsed.tools = parsed.tools
                    ? parsed.tools + ', ' + cleanedLine
                    : cleanedLine;
                break;
            default:
                parsed.technicalSkills = parsed.technicalSkills
                    ? parsed.technicalSkills + ', ' + cleanedLine
                    : cleanedLine;
        }
    },

    // Parse project lines
    parseProjectLine(line, parsed) {
        // Check for bullet points (project details)
        if (/^[•\-\*▪]\s*/.test(line)) {
            if (parsed.projects.length > 0) {
                const lastProj = parsed.projects[parsed.projects.length - 1];
                const bulletText = line.replace(/^[•\-\*▪]\s*/, '');

                // Check if this looks like technologies
                if (/^(?:Technologies?|Tech|Built with|Stack):?\s*/i.test(bulletText)) {
                    lastProj.technologies = bulletText.replace(/^(?:Technologies?|Tech|Built with|Stack):?\s*/i, '');
                } else {
                    lastProj.description += (lastProj.description ? ' ' : '') + bulletText;
                }
            }
            return;
        }

        // New project entry
        if (line.length > 5) {
            // Try to extract project link
            const linkMatch = line.match(/(?:https?:\/\/)?(?:github\.com|gitlab\.com|bitbucket\.org)\/[\w-]+\/[\w-]+/i);

            parsed.projects.push({
                name: line.replace(linkMatch ? linkMatch[0] : '', '').trim(),
                description: '',
                technologies: '',
                link: linkMatch ? linkMatch[0] : ''
            });
        }
    },

    // Parse certification lines
    parseCertificationLine(line, parsed) {
        if (line.length < 5) return;

        // Remove bullet points
        const cleanLine = line.replace(/^[•\-\*▪]\s*/, '');

        const cert = {
            name: cleanLine,
            issuer: '',
            date: ''
        };

        // Extract date
        const dateMatch = cleanLine.match(/\b(19|20)\d{2}\b/);
        if (dateMatch) {
            cert.date = dateMatch[0];
        }

        // Extract issuer (common certification providers)
        const issuerPatterns = [
            /(?:by|from|issued by)\s+([A-Za-z\s]+)/i,
            /(AWS|Google|Microsoft|Cisco|CompTIA|Oracle|Salesforce|Adobe|PMI|Scrum)/i
        ];

        for (const pattern of issuerPatterns) {
            const match = cleanLine.match(pattern);
            if (match) {
                cert.issuer = match[1].trim();
                break;
            }
        }

        parsed.certifications.push(cert);
    },

    // Parse unknown section lines - try to auto-detect content
    parseUnknownLine(line, parsed) {
        // Check if it looks like a bullet point for experience
        if (/^[•\-\*▪]\s*/.test(line) && parsed.experience.length > 0) {
            const bulletText = line.replace(/^[•\-\*▪]\s*/, '');
            const lastExp = parsed.experience[parsed.experience.length - 1];
            if (!lastExp.bullets) lastExp.bullets = [];
            lastExp.bullets.push(bulletText);
            return;
        }

        // Check if it looks like a skill list
        if (line.includes(',') && line.split(',').length > 2) {
            const skills = line.split(',');
            const isSkillList = skills.every(s => s.trim().length < 30);
            if (isSkillList) {
                if (parsed.technicalSkills) parsed.technicalSkills += ', ';
                parsed.technicalSkills += line;
            }
        }
    },

    // Clean up parsed data
    cleanupParsedData(parsed) {
        // Trim all string fields
        for (const key of Object.keys(parsed)) {
            if (typeof parsed[key] === 'string') {
                parsed[key] = parsed[key].trim();
            }
        }

        // Remove duplicate commas in skills
        if (parsed.technicalSkills) {
            parsed.technicalSkills = parsed.technicalSkills
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0)
                .filter((s, i, arr) => arr.indexOf(s) === i) // unique
                .join(', ');
        }
        if (parsed.softSkills) {
            parsed.softSkills = parsed.softSkills
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0)
                .filter((s, i, arr) => arr.indexOf(s) === i)
                .join(', ');
        }

        // Ensure all experience entries have bullets array
        for (const exp of parsed.experience) {
            if (!exp.bullets) exp.bullets = [];
        }

        // Ensure all education entries have required fields
        for (const edu of parsed.education) {
            edu.degree = edu.degree || '';
            edu.school = edu.school || '';
            edu.graduationDate = edu.graduationDate || '';
        }
    },

    // Optimize resume for specific job description
    optimizeResume(resumeData, jobKeywords) {
        if (!resumeData) return null;

        const optimized = JSON.parse(JSON.stringify(resumeData));
        const changes = [];

        // Generate summary if missing
        if (!optimized.summary && optimized.experience && optimized.experience.length > 0) {
            optimized.summary = this.generateSummary(optimized, jobKeywords);
            changes.push({
                type: 'added',
                section: 'Summary',
                text: 'Generated professional summary',
                keywords: []
            });
        }

        // Optimize existing summary
        if (optimized.summary) {
            const result = this.optimizeSummary(optimized.summary, jobKeywords);
            optimized.summary = result.text;
            changes.push(...result.changes);
        }

        // Optimize experience bullets
        if (optimized.experience) {
            for (let i = 0; i < optimized.experience.length; i++) {
                const exp = optimized.experience[i];
                if (exp.bullets && exp.bullets.length > 0) {
                    const result = this.optimizeBullets(exp.bullets, jobKeywords);
                    optimized.experience[i].bullets = result.bullets;
                    changes.push(...result.changes);
                }
            }
        }

        // Optimize skills
        const skillsResult = this.optimizeSkills(optimized, jobKeywords);
        optimized.technicalSkills = skillsResult.technical;
        optimized.softSkills = skillsResult.soft;
        changes.push(...skillsResult.changes);

        optimized.changes = changes;
        optimized.optimizedAt = new Date().toISOString();

        return optimized;
    },

    // Generate a summary if none exists
    generateSummary(resumeData, jobKeywords) {
        const parts = [];

        // Experience level based on years
        const expCount = resumeData.experience ? resumeData.experience.length : 0;
        if (expCount > 3) {
            parts.push('Seasoned professional');
        } else if (expCount > 1) {
            parts.push('Experienced professional');
        } else {
            parts.push('Motivated professional');
        }

        // Add latest role
        if (resumeData.experience && resumeData.experience[0] && resumeData.experience[0].title) {
            parts.push(`with background in ${resumeData.experience[0].title.toLowerCase()}`);
        }

        // Add key skills from job keywords
        if (jobKeywords && jobKeywords.technical && jobKeywords.technical.length > 0) {
            const topSkills = jobKeywords.technical.slice(0, 3).join(', ');
            parts.push(`Proficient in ${topSkills}.`);
        } else if (resumeData.technicalSkills) {
            const skills = resumeData.technicalSkills.split(',').slice(0, 3).map(s => s.trim()).join(', ');
            if (skills) {
                parts.push(`Skilled in ${skills}.`);
            }
        }

        return parts.join(' ');
    },

    // Optimize summary section
    optimizeSummary(summary, jobKeywords) {
        if (!summary || !jobKeywords) return { text: summary, changes: [] };

        let optimized = summary;
        const changes = [];

        // Add missing key technical skills to summary
        if (jobKeywords.technical) {
            const summaryLower = summary.toLowerCase();
            const missingKeywords = jobKeywords.technical.filter(k =>
                !summaryLower.includes(k.toLowerCase())
            ).slice(0, 3);

            if (missingKeywords.length > 0) {
                const keywordPhrase = missingKeywords.join(', ');
                if (!optimized.endsWith('.')) optimized += '.';
                optimized += ` Proficient in ${keywordPhrase}.`;
                changes.push({
                    type: 'added',
                    section: 'Summary',
                    text: `Added skills: ${keywordPhrase}`,
                    keywords: missingKeywords
                });
            }
        }

        return { text: optimized, changes };
    },

    // Optimize bullet points
    optimizeBullets(bullets, jobKeywords) {
        if (!bullets || bullets.length === 0) return { bullets, changes: [] };

        const changes = [];
        const optimizedBullets = bullets.map((bullet, idx) => {
            if (!bullet || bullet.trim().length === 0) return bullet;

            let optimized = bullet.trim();

            // Add action verb if missing
            const words = optimized.split(' ');
            if (words.length === 0) return optimized;

            const firstWord = words[0].toLowerCase();

            // Check if first word is an action verb
            const actionVerbs = KeywordExtractor && KeywordExtractor.actionVerbs
                ? KeywordExtractor.actionVerbs
                : ['developed', 'created', 'managed', 'led', 'implemented'];

            const hasActionVerb = actionVerbs.some(verb =>
                firstWord === verb.toLowerCase() ||
                firstWord.startsWith(verb.toLowerCase().slice(0, -1))
            );

            if (!hasActionVerb && optimized.length > 15) {
                const verb = this.selectActionVerb(optimized);
                optimized = verb + ' ' + optimized.charAt(0).toLowerCase() + optimized.slice(1);
                changes.push({
                    type: 'improved',
                    section: 'Experience',
                    text: `Added action verb "${verb}"`,
                    keywords: [verb]
                });
            }

            // Ensure proper capitalization
            optimized = optimized.charAt(0).toUpperCase() + optimized.slice(1);

            // Ensure proper punctuation
            if (!optimized.endsWith('.') && !optimized.endsWith('!') && !optimized.endsWith('?')) {
                optimized += '.';
            }

            return optimized;
        });

        return { bullets: optimizedBullets.filter(b => b && b.length > 0), changes };
    },

    // Select appropriate action verb based on content
    selectActionVerb(text) {
        const lower = text.toLowerCase();

        const verbMappings = [
            { keywords: ['team', 'collaborate', 'together', 'cross-functional'], verb: 'Collaborated' },
            { keywords: ['develop', 'build', 'create', 'wrote', 'code'], verb: 'Developed' },
            { keywords: ['manage', 'oversee', 'supervise', 'responsible'], verb: 'Managed' },
            { keywords: ['design', 'architect', 'plan', 'blueprint'], verb: 'Designed' },
            { keywords: ['improve', 'enhance', 'optimize', 'boost'], verb: 'Improved' },
            { keywords: ['analyze', 'research', 'study', 'investigate'], verb: 'Analyzed' },
            { keywords: ['implement', 'deploy', 'launch', 'roll out'], verb: 'Implemented' },
            { keywords: ['reduce', 'decrease', 'cut', 'lower'], verb: 'Reduced' },
            { keywords: ['increase', 'grow', 'expand', 'scale'], verb: 'Increased' },
            { keywords: ['lead', 'head', 'direct', 'guide'], verb: 'Led' },
            { keywords: ['support', 'assist', 'help', 'aid'], verb: 'Supported' },
            { keywords: ['test', 'verify', 'validate', 'check'], verb: 'Tested' },
            { keywords: ['train', 'mentor', 'teach', 'coach'], verb: 'Mentored' },
            { keywords: ['automate', 'script', 'streamline'], verb: 'Automated' }
        ];

        for (const { keywords, verb } of verbMappings) {
            if (keywords.some(kw => lower.includes(kw))) {
                return verb;
            }
        }

        return 'Executed';
    },

    // Optimize skills section
    optimizeSkills(resumeData, jobKeywords) {
        const changes = [];
        let technical = resumeData.technicalSkills || '';
        let soft = resumeData.softSkills || '';

        if (jobKeywords) {
            // Add missing technical skills
            const existingTechnical = technical.toLowerCase();
            const missingTechnical = (jobKeywords.technical || []).filter(k =>
                !existingTechnical.includes(k.toLowerCase())
            );

            if (missingTechnical.length > 0) {
                const toAdd = missingTechnical.slice(0, 5).join(', ');
                if (technical) technical += ', ';
                technical += toAdd;
                changes.push({
                    type: 'added',
                    section: 'Skills',
                    text: `Added missing skills: ${toAdd}`,
                    keywords: missingTechnical.slice(0, 5)
                });
            }

            // Add missing soft skills
            const existingSoft = soft.toLowerCase();
            const missingSoft = (jobKeywords.soft || []).filter(k =>
                !existingSoft.includes(k.toLowerCase())
            );

            if (missingSoft.length > 0) {
                const toAdd = missingSoft.slice(0, 3).join(', ');
                if (soft) soft += ', ';
                soft += toAdd;
                changes.push({
                    type: 'added',
                    section: 'Skills',
                    text: `Added soft skills: ${toAdd}`,
                    keywords: missingSoft.slice(0, 3)
                });
            }
        }

        return { technical, soft, changes };
    },

    // Compare before and after optimization
    compareVersions(original, optimized) {
        const comparison = {
            beforeScore: 0,
            afterScore: 0,
            improvements: [],
            addedKeywords: [],
            changedSections: []
        };

        if (optimized.changes) {
            comparison.improvements = optimized.changes;
            comparison.addedKeywords = optimized.changes
                .filter(c => c.keywords)
                .flatMap(c => c.keywords);
            comparison.changedSections = [...new Set(optimized.changes.map(c => c.section))];
        }

        return comparison;
    }
};

// Make available globally
window.ResumeOptimizer = ResumeOptimizer;
