"""
GoBot - AI Resume Optimizer
Python Flask Backend Server
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import re
import json
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    """Check if uploaded file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ============================================================================
# Keyword Extraction Module
# ============================================================================

class KeywordExtractor:
    """Extract relevant keywords from job descriptions"""
    
    TECHNICAL_SKILLS = {
        'programming': ['javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'typescript', 'scala', 'r', 'matlab', 'perl', 'html', 'css', 'sql', 'nosql', 'graphql'],
        'frameworks': ['react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'rails', 'laravel', '.net', 'asp.net', 'next.js', 'nuxt', 'gatsby', 'svelte', 'bootstrap', 'tailwind', 'jquery', 'redux', 'fastapi'],
        'databases': ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sql server', 'sqlite', 'dynamodb', 'cassandra', 'firebase', 'supabase', 'mariadb'],
        'cloud': ['aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digitalocean', 'cloudflare', 'vercel', 'netlify', 'kubernetes', 'docker', 'terraform', 'ansible', 'jenkins', 'circleci', 'github actions'],
        'tools': ['git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'vscode', 'intellij', 'postman', 'swagger', 'webpack', 'babel', 'npm', 'yarn'],
        'data': ['machine learning', 'deep learning', 'artificial intelligence', 'ai', 'ml', 'data science', 'data analysis', 'data engineering', 'big data', 'hadoop', 'spark', 'tableau', 'power bi', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'nlp', 'computer vision'],
        'methodologies': ['agile', 'scrum', 'kanban', 'waterfall', 'devops', 'ci/cd', 'tdd', 'bdd', 'microservices', 'rest', 'api', 'soap', 'graphql', 'oauth', 'jwt']
    }

    SOFT_SKILLS = [
        'leadership', 'communication', 'teamwork', 'collaboration', 'problem-solving', 'problem solving',
        'critical thinking', 'analytical', 'creative', 'creativity', 'adaptable', 'adaptability',
        'time management', 'organized', 'organization', 'detail-oriented', 'attention to detail',
        'self-motivated', 'motivated', 'proactive', 'initiative', 'interpersonal', 'presentation',
        'negotiation', 'conflict resolution', 'decision-making', 'strategic thinking', 'mentoring',
        'coaching', 'customer service', 'client-facing', 'stakeholder management', 'cross-functional'
    ]

    ACTION_VERBS = [
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
    ]

    SKILL_NORMALIZATION = {
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
        'python': 'Python',
        'java': 'Java',
        'flask': 'Flask',
        'django': 'Django',
        'fastapi': 'FastAPI'
    }

    @classmethod
    def extract_from_job_description(cls, job_description):
        """Extract keywords from job description"""
        if not job_description:
            return {'technical': [], 'soft': [], 'requirements': [], 'experience': [], 'education': [], 'all': []}

        text = job_description.lower()
        extracted = {
            'technical': [],
            'soft': [],
            'requirements': [],
            'experience': [],
            'education': [],
            'all': []
        }

        # Extract technical skills
        for category, skills in cls.TECHNICAL_SKILLS.items():
            for skill in skills:
                if skill in text:
                    normalized = cls.normalize_skill(skill)
                    if normalized not in extracted['technical']:
                        extracted['technical'].append(normalized)

        # Extract soft skills
        for skill in cls.SOFT_SKILLS:
            if skill in text:
                normalized = cls.normalize_skill(skill)
                if normalized not in extracted['soft']:
                    extracted['soft'].append(normalized)

        # Extract experience requirements
        exp_patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)',
            r'(?:experience|exp)\s*(?:of\s*)?(\d+)\+?\s*(?:years?|yrs?)',
        ]
        for pattern in exp_patterns:
            matches = re.findall(pattern, job_description, re.IGNORECASE)
            extracted['experience'].extend(matches)

        # Combine all keywords
        extracted['all'] = list(set(extracted['technical'] + extracted['soft'] + extracted['requirements']))

        return extracted

    @classmethod
    def normalize_skill(cls, skill):
        """Normalize skill name for display"""
        lower = skill.lower()
        if lower in cls.SKILL_NORMALIZATION:
            return cls.SKILL_NORMALIZATION[lower]
        return ' '.join(word.capitalize() for word in skill.split())

    @classmethod
    def find_matches(cls, resume_text, job_keywords):
        """Find matching and missing keywords"""
        if not resume_text or not job_keywords:
            return {'matched': [], 'missing': []}

        resume_lower = resume_text.lower()
        matched = []
        missing = []

        for keyword in job_keywords.get('all', []):
            if keyword.lower() in resume_lower:
                matched.append(keyword)
            else:
                missing.append(keyword)

        return {'matched': matched, 'missing': missing}


# ============================================================================
# ATS Scoring Module
# ============================================================================

class ATSScoring:
    """Calculate ATS compatibility score for resumes"""
    
    WEIGHTS = {
        'keywords': 0.35,
        'format': 0.25,
        'content': 0.25,
        'completeness': 0.15
    }

    @classmethod
    def calculate_score(cls, resume_data, job_keywords):
        """Calculate overall ATS score"""
        scores = {
            'keywords': cls.calculate_keyword_score(resume_data, job_keywords),
            'format': cls.calculate_format_score(resume_data),
            'content': cls.calculate_content_score(resume_data),
            'completeness': cls.calculate_completeness_score(resume_data)
        }

        overall = int(
            scores['keywords'] * cls.WEIGHTS['keywords'] +
            scores['format'] * cls.WEIGHTS['format'] +
            scores['content'] * cls.WEIGHTS['content'] +
            scores['completeness'] * cls.WEIGHTS['completeness']
        )

        return {
            'overall': min(100, max(0, overall)),
            'breakdown': scores,
            'tips': cls.generate_tips(scores, resume_data, job_keywords)
        }

    @classmethod
    def calculate_keyword_score(cls, resume_data, job_keywords):
        """Calculate keyword matching score"""
        if not job_keywords or not job_keywords.get('all'):
            return 70

        resume_text = cls.get_full_resume_text(resume_data).lower()
        matched_count = sum(1 for kw in job_keywords['all'] if kw.lower() in resume_text)
        
        match_percentage = (matched_count / len(job_keywords['all'])) * 100 if job_keywords['all'] else 0

        if match_percentage >= 80:
            return 95
        elif match_percentage >= 60:
            return 75 + (match_percentage - 60)
        elif match_percentage >= 30:
            return 50 + (match_percentage - 30) * 0.83
        return match_percentage * 1.67

    @classmethod
    def calculate_format_score(cls, resume_data):
        """Calculate format score"""
        score = 100

        if not resume_data.get('fullName'):
            score -= 15
        if not resume_data.get('email'):
            score -= 15
        if not resume_data.get('phone'):
            score -= 5
        if not resume_data.get('experience'):
            score -= 10

        return max(0, score)

    @classmethod
    def calculate_content_score(cls, resume_data):
        """Calculate content quality score"""
        score = 0
        total_bullets = 0
        good_bullets = 0

        for exp in resume_data.get('experience', []):
            for bullet in exp.get('bullets', []):
                total_bullets += 1
                if cls.is_good_bullet_point(bullet):
                    good_bullets += 1

        if total_bullets > 0:
            score += (good_bullets / total_bullets) * 60
        else:
            score += 30

        summary = resume_data.get('summary', '')
        if summary and 100 <= len(summary) <= 500:
            score += 20
        elif summary and len(summary) > 50:
            score += 10

        if resume_data.get('technicalSkills') or resume_data.get('softSkills'):
            score += 20

        return min(100, score)

    @classmethod
    def calculate_completeness_score(cls, resume_data):
        """Calculate completeness score"""
        sections = [
            ('fullName', 15), ('email', 15), ('phone', 5), ('summary', 15),
            ('experience', 20), ('education', 15), ('technicalSkills', 10), ('projects', 5)
        ]

        score = 0
        for key, weight in sections:
            value = resume_data.get(key)
            if value and (len(value) > 0 if isinstance(value, (list, str)) else True):
                score += weight

        return score

    @classmethod
    def is_good_bullet_point(cls, bullet):
        """Check if bullet point follows best practices"""
        if not bullet or len(bullet) < 20:
            return False

        words = bullet.lower().split()
        if not words:
            return False
        
        first_word = words[0]
        has_action_verb = any(first_word.startswith(verb.lower()) for verb in KeywordExtractor.ACTION_VERBS)
        has_metrics = bool(re.search(r'\d+%?|\$[\d,]+|[\d,]+\s*(users?|customers?|clients?)', bullet, re.IGNORECASE))

        return (has_action_verb and has_metrics) or (has_action_verb and len(bullet) > 50) or has_metrics

    @classmethod
    def get_full_resume_text(cls, resume_data):
        """Get full resume text for keyword matching"""
        parts = []
        
        for key in ['fullName', 'summary', 'technicalSkills', 'softSkills', 'tools']:
            if resume_data.get(key):
                parts.append(str(resume_data[key]))

        for exp in resume_data.get('experience', []):
            parts.extend([exp.get('title', ''), exp.get('company', '')])
            parts.extend(exp.get('bullets', []))

        for edu in resume_data.get('education', []):
            parts.extend([edu.get('degree', ''), edu.get('school', ''), edu.get('field', '')])

        for proj in resume_data.get('projects', []):
            parts.extend([proj.get('name', ''), proj.get('description', ''), proj.get('technologies', '')])

        return ' '.join(filter(None, parts))

    @classmethod
    def generate_tips(cls, scores, resume_data, job_keywords):
        """Generate improvement tips"""
        tips = []

        if scores['keywords'] < 60:
            tips.append({'type': 'keywords', 'priority': 'high', 'text': 'Add more keywords from the job description'})

        if not resume_data.get('phone'):
            tips.append({'type': 'format', 'priority': 'medium', 'text': 'Add a phone number'})

        if scores['content'] < 70:
            tips.append({'type': 'content', 'priority': 'high', 'text': 'Use action verbs and include measurable achievements'})

        if not resume_data.get('summary') or len(resume_data.get('summary', '')) < 50:
            tips.append({'type': 'content', 'priority': 'medium', 'text': 'Add a professional summary'})

        return tips[:5]


# ============================================================================
# Resume Parser Module
# ============================================================================

class ResumeParser:
    """Parse resume files into structured data"""

    @classmethod
    def parse_file(cls, filepath):
        """Parse resume file based on extension"""
        ext = filepath.rsplit('.', 1)[1].lower() if '.' in filepath else ''
        
        if ext == 'pdf':
            return cls.parse_pdf(filepath)
        elif ext in ['docx', 'doc']:
            return cls.parse_docx(filepath)
        elif ext == 'txt':
            return cls.parse_txt(filepath)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    @classmethod
    def parse_pdf(cls, filepath):
        """Parse PDF file"""
        try:
            import PyPDF2
            text = ""
            with open(filepath, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            return cls.parse_text(text)
        except ImportError:
            # Fallback if PyPDF2 not installed
            return {'error': 'PDF parsing requires PyPDF2. Install with: pip install PyPDF2', 'rawText': ''}
        except Exception as e:
            return {'error': str(e), 'rawText': ''}

    @classmethod
    def parse_docx(cls, filepath):
        """Parse DOCX file"""
        try:
            from docx import Document
            doc = Document(filepath)
            text = "\n".join([para.text for para in doc.paragraphs])
            return cls.parse_text(text)
        except ImportError:
            return {'error': 'DOCX parsing requires python-docx. Install with: pip install python-docx', 'rawText': ''}
        except Exception as e:
            return {'error': str(e), 'rawText': ''}

    @classmethod
    def parse_txt(cls, filepath):
        """Parse TXT file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as file:
                text = file.read()
            return cls.parse_text(text)
        except Exception as e:
            return {'error': str(e), 'rawText': ''}

    @classmethod
    def parse_text(cls, text):
        """Parse resume text into structured data"""
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        parsed = {
            'fullName': '',
            'email': '',
            'phone': '',
            'summary': '',
            'experience': [],
            'education': [],
            'technicalSkills': '',
            'softSkills': '',
            'projects': [],
            'certifications': [],
            'rawText': text
        }

        current_section = 'header'
        current_exp = None

        for i, line in enumerate(lines):
            lower_line = line.lower()

            # Detect sections
            if cls.is_section_header(line, 'experience') or cls.is_section_header(line, 'work'):
                current_section = 'experience'
                continue
            elif cls.is_section_header(line, 'education'):
                current_section = 'education'
                continue
            elif cls.is_section_header(line, 'skills') or cls.is_section_header(line, 'technical'):
                current_section = 'skills'
                continue
            elif cls.is_section_header(line, 'projects'):
                current_section = 'projects'
                continue
            elif cls.is_section_header(line, 'summary') or cls.is_section_header(line, 'objective'):
                current_section = 'summary'
                continue

            # Parse based on section
            if current_section == 'header':
                cls.parse_header_line(line, parsed)
            elif current_section == 'summary':
                parsed['summary'] += ' ' + line if parsed['summary'] else line
            elif current_section == 'experience':
                cls.parse_experience_line(line, parsed)
            elif current_section == 'education':
                cls.parse_education_line(line, parsed)
            elif current_section == 'skills':
                if parsed['technicalSkills']:
                    parsed['technicalSkills'] += ', ' + line
                else:
                    parsed['technicalSkills'] = line

        return parsed

    @classmethod
    def is_section_header(cls, line, keyword):
        """Check if line is a section header"""
        lower = re.sub(r'[^a-z\s]', '', line.lower())
        return keyword in lower and len(line) < 50

    @classmethod
    def parse_header_line(cls, line, parsed):
        """Parse header line for contact info"""
        # Email
        email_match = re.search(r'[\w.-]+@[\w.-]+\.\w+', line)
        if email_match:
            parsed['email'] = email_match.group()
            return

        # Phone
        phone_match = re.search(r'[\+]?[\d\s\-()]{10,}', line)
        if phone_match:
            parsed['phone'] = phone_match.group().strip()
            return

        # Name (first non-contact line)
        if not parsed['fullName'] and '@' not in line and 'linkedin' not in line.lower():
            if 2 < len(line) < 50:
                parsed['fullName'] = line

    @classmethod
    def parse_experience_line(cls, line, parsed):
        """Parse experience lines"""
        # Bullet points
        if line.startswith(('•', '-', '*')) or re.match(r'^\d+\.', line):
            bullet_text = re.sub(r'^[•\-*]\s*|\d+\.\s*', '', line)
            if parsed['experience']:
                if 'bullets' not in parsed['experience'][-1]:
                    parsed['experience'][-1]['bullets'] = []
                parsed['experience'][-1]['bullets'].append(bullet_text)
            return

        # Job title/company detection
        title_keywords = ['engineer', 'developer', 'manager', 'director', 'analyst', 'designer', 'lead', 'senior']
        if any(kw in line.lower() for kw in title_keywords):
            parsed['experience'].append({
                'title': line.split('|')[0].strip() if '|' in line else line,
                'company': line.split('|')[1].strip() if '|' in line and len(line.split('|')) > 1 else '',
                'bullets': []
            })

    @classmethod
    def parse_education_line(cls, line, parsed):
        """Parse education lines"""
        degree_patterns = ['bachelor', 'master', 'ph.d', 'b.s', 'm.s', 'mba', 'associate']
        if any(p in line.lower() for p in degree_patterns):
            parsed['education'].append({
                'degree': line,
                'school': '',
                'graduationDate': ''
            })


# ============================================================================
# Resume Optimizer Module
# ============================================================================

class ResumeOptimizer:
    """Optimize resumes for ATS compatibility"""

    @classmethod
    def optimize(cls, resume_data, job_keywords):
        """Optimize resume for specific job description"""
        optimized = resume_data.copy()
        changes = []

        # Optimize summary
        if optimized.get('summary') and job_keywords.get('technical'):
            result = cls.optimize_summary(optimized['summary'], job_keywords)
            optimized['summary'] = result['text']
            changes.extend(result['changes'])

        # Optimize experience bullets
        if optimized.get('experience'):
            for i, exp in enumerate(optimized['experience']):
                if exp.get('bullets'):
                    result = cls.optimize_bullets(exp['bullets'], job_keywords)
                    optimized['experience'][i]['bullets'] = result['bullets']
                    changes.extend(result['changes'])

        # Optimize skills
        result = cls.optimize_skills(optimized, job_keywords)
        optimized['technicalSkills'] = result['technical']
        optimized['softSkills'] = result['soft']
        changes.extend(result['changes'])

        optimized['changes'] = changes
        return optimized

    @classmethod
    def optimize_summary(cls, summary, job_keywords):
        """Optimize summary section"""
        changes = []
        optimized = summary

        if job_keywords.get('technical'):
            summary_lower = summary.lower()
            missing = [k for k in job_keywords['technical'][:3] if k.lower() not in summary_lower]
            
            if missing:
                keyword_phrase = ', '.join(missing)
                if not optimized.endswith('.'):
                    optimized += '.'
                optimized += f' Proficient in {keyword_phrase}.'
                changes.append({
                    'type': 'added',
                    'section': 'Summary',
                    'text': f'Added skills: {keyword_phrase}',
                    'keywords': missing
                })

        return {'text': optimized, 'changes': changes}

    @classmethod
    def optimize_bullets(cls, bullets, job_keywords):
        """Optimize bullet points"""
        changes = []
        optimized_bullets = []

        for bullet in bullets:
            if not bullet:
                continue

            optimized = bullet.strip()
            words = optimized.split()
            
            if words:
                first_word = words[0].lower()
                has_action_verb = any(first_word.startswith(v.lower()) for v in KeywordExtractor.ACTION_VERBS)

                if not has_action_verb and len(optimized) > 20:
                    verb = cls.select_action_verb(optimized)
                    optimized = verb + ' ' + optimized[0].lower() + optimized[1:]
                    changes.append({
                        'type': 'improved',
                        'section': 'Experience',
                        'text': f'Added action verb "{verb}"',
                        'keywords': [verb]
                    })

            # Ensure proper capitalization and punctuation
            optimized = optimized[0].upper() + optimized[1:] if optimized else ''
            if optimized and not optimized.endswith('.'):
                optimized += '.'

            optimized_bullets.append(optimized)

        return {'bullets': optimized_bullets, 'changes': changes}

    @classmethod
    def select_action_verb(cls, text):
        """Select appropriate action verb based on content"""
        lower = text.lower()
        
        verb_mappings = {
            'team': 'Collaborated',
            'develop': 'Developed',
            'manage': 'Managed',
            'create': 'Created',
            'design': 'Designed',
            'improve': 'Improved',
            'analyze': 'Analyzed',
            'implement': 'Implemented',
            'lead': 'Led',
            'test': 'Tested'
        }

        for keyword, verb in verb_mappings.items():
            if keyword in lower:
                return verb

        return 'Executed'

    @classmethod
    def optimize_skills(cls, resume_data, job_keywords):
        """Optimize skills section"""
        changes = []
        technical = resume_data.get('technicalSkills', '')
        soft = resume_data.get('softSkills', '')

        if job_keywords:
            # Add missing technical skills
            existing_technical = technical.lower()
            missing_technical = [k for k in job_keywords.get('technical', []) if k.lower() not in existing_technical]

            if missing_technical[:5]:
                to_add = ', '.join(missing_technical[:5])
                technical = f'{technical}, {to_add}' if technical else to_add
                changes.append({
                    'type': 'added',
                    'section': 'Skills',
                    'text': f'Added missing skills: {to_add}',
                    'keywords': missing_technical[:5]
                })

            # Add missing soft skills
            existing_soft = soft.lower()
            missing_soft = [k for k in job_keywords.get('soft', []) if k.lower() not in existing_soft]

            if missing_soft[:3]:
                to_add = ', '.join(missing_soft[:3])
                soft = f'{soft}, {to_add}' if soft else to_add
                changes.append({
                    'type': 'added',
                    'section': 'Skills',
                    'text': f'Added soft skills: {to_add}',
                    'keywords': missing_soft[:3]
                })

        return {'technical': technical, 'soft': soft, 'changes': changes}


# ============================================================================
# API Routes
# ============================================================================

@app.route('/')
def serve_index():
    """Serve the main application"""
    return send_from_directory('.', 'index.html')


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'GoBot API is running'})


@app.route('/api/extract-keywords', methods=['POST'])
def extract_keywords():
    """Extract keywords from job description"""
    data = request.get_json()
    job_description = data.get('jobDescription', '')
    
    keywords = KeywordExtractor.extract_from_job_description(job_description)
    return jsonify({'success': True, 'keywords': keywords})


@app.route('/api/calculate-score', methods=['POST'])
def calculate_score():
    """Calculate ATS score for resume"""
    data = request.get_json()
    resume_data = data.get('resumeData', {})
    job_keywords = data.get('jobKeywords', {})
    
    score = ATSScoring.calculate_score(resume_data, job_keywords)
    return jsonify({'success': True, 'score': score})


@app.route('/api/optimize-resume', methods=['POST'])
def optimize_resume():
    """Optimize resume for job description"""
    data = request.get_json()
    resume_data = data.get('resumeData', {})
    job_keywords = data.get('jobKeywords', {})
    
    optimized = ResumeOptimizer.optimize(resume_data, job_keywords)
    score = ATSScoring.calculate_score(optimized, job_keywords)
    
    return jsonify({
        'success': True,
        'optimizedResume': optimized,
        'score': score
    })


@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    """Upload and parse resume file"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({
            'success': False, 
            'error': f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
        }), 400

    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Parse the resume
        parsed = ResumeParser.parse_file(filepath)

        # Clean up uploaded file
        os.remove(filepath)

        if 'error' in parsed and parsed['error']:
            return jsonify({'success': False, 'error': parsed['error']}), 500

        return jsonify({'success': True, 'parsedResume': parsed})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/parse-text', methods=['POST'])
def parse_text():
    """Parse resume from text"""
    data = request.get_json()
    resume_text = data.get('text', '')
    
    if not resume_text:
        return jsonify({'success': False, 'error': 'No text provided'}), 400

    parsed = ResumeParser.parse_text(resume_text)
    return jsonify({'success': True, 'parsedResume': parsed})


@app.route('/api/suggestions', methods=['POST'])
def get_suggestions():
    """Get skill suggestions based on job description"""
    data = request.get_json()
    resume_skills = data.get('resumeSkills', [])
    job_keywords = data.get('jobKeywords', {})
    
    suggestions = []
    resume_skills_lower = [s.lower() for s in resume_skills]

    for skill in job_keywords.get('technical', []) + job_keywords.get('soft', []):
        if skill.lower() not in resume_skills_lower:
            suggestions.append({
                'skill': skill,
                'type': 'technical' if skill in job_keywords.get('technical', []) else 'soft',
                'priority': 'high'
            })

    return jsonify({'success': True, 'suggestions': suggestions[:10]})


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("GoBot - AI Resume Optimizer")
    print("=" * 60)
    print(f"Server starting at: http://localhost:5000")
    print(f"Upload folder: {os.path.abspath(UPLOAD_FOLDER)}")
    print("-" * 60)
    print("API Endpoints:")
    print("  GET  /api/health          - Health check")
    print("  POST /api/extract-keywords - Extract keywords from job description")
    print("  POST /api/calculate-score  - Calculate ATS score")
    print("  POST /api/optimize-resume  - Optimize resume")
    print("  POST /api/upload-resume    - Upload and parse resume file")
    print("  POST /api/parse-text       - Parse resume from text")
    print("  POST /api/suggestions      - Get skill suggestions")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
