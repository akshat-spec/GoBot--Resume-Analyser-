/**
 * GoBot - DOCX Export
 * Generates Word documents from resume data
 */

const ExportDOCX = {
    // Generate DOCX from resume data
    async generateDOCX(resumeData) {
        const formatted = ResumeGenerator.formatForDisplay(resumeData);

        // Generate the document content as XML
        const docContent = this.generateDocumentXML(formatted);

        // Create the DOCX package
        const blob = await this.createDOCXBlob(docContent, formatted.header.name);

        // Download the file
        this.downloadBlob(blob, `${formatted.header.name.replace(/\s+/g, '_')}_Resume.docx`);

        return true;
    },

    // Generate Office Open XML content
    generateDocumentXML(data) {
        const paragraphs = [];

        // Name
        paragraphs.push(this.createParagraph(data.header.name, {
            bold: true,
            fontSize: 32,
            centered: true,
            spacing: 200
        }));

        // Contact info
        const contactParts = [
            data.header.email,
            data.header.phone,
            data.header.location,
            data.header.linkedin,
            data.header.portfolio
        ].filter(Boolean);

        if (contactParts.length > 0) {
            paragraphs.push(this.createParagraph(contactParts.join(' | '), {
                centered: true,
                fontSize: 20
            }));
        }

        // Line break after header
        paragraphs.push(this.createParagraph('', { spacing: 100 }));

        // Summary
        if (data.summary) {
            paragraphs.push(this.createSectionHeader('PROFESSIONAL SUMMARY'));
            paragraphs.push(this.createParagraph(data.summary, { justify: true }));
            paragraphs.push(this.createParagraph('', { spacing: 100 }));
        }

        // Experience
        if (data.experience.length > 0) {
            paragraphs.push(this.createSectionHeader('PROFESSIONAL EXPERIENCE'));

            for (const exp of data.experience) {
                // Title line
                paragraphs.push(this.createParagraph(exp.title, { bold: true }));

                // Company and date line
                const companyLine = `${exp.company}${exp.location ? ' | ' + exp.location : ''}`;
                const dateLine = `${exp.startDate} - ${exp.endDate}`;
                paragraphs.push(this.createTwoColumnParagraph(companyLine, dateLine, { italic: true }));

                // Bullets
                for (const bullet of exp.bullets.filter(b => b && b.trim())) {
                    paragraphs.push(this.createBulletParagraph(bullet));
                }

                paragraphs.push(this.createParagraph('', { spacing: 80 }));
            }
        }

        // Education
        if (data.education.length > 0) {
            paragraphs.push(this.createSectionHeader('EDUCATION'));

            for (const edu of data.education) {
                const degreeLine = `${edu.degree}${edu.field ? ' in ' + edu.field : ''}`;
                paragraphs.push(this.createParagraph(degreeLine, { bold: true }));

                const schoolLine = `${edu.school}${edu.location ? ' | ' + edu.location : ''}`;
                paragraphs.push(this.createTwoColumnParagraph(schoolLine, edu.graduationDate, { italic: true }));

                if (edu.gpa) {
                    paragraphs.push(this.createParagraph(`GPA: ${edu.gpa}`));
                }

                paragraphs.push(this.createParagraph('', { spacing: 80 }));
            }
        }

        // Skills
        if (data.skills.technical || data.skills.soft || data.skills.tools) {
            paragraphs.push(this.createSectionHeader('SKILLS'));

            if (data.skills.technical) {
                paragraphs.push(this.createParagraph(`Technical Skills: ${data.skills.technical}`));
            }
            if (data.skills.soft) {
                paragraphs.push(this.createParagraph(`Soft Skills: ${data.skills.soft}`));
            }
            if (data.skills.tools) {
                paragraphs.push(this.createParagraph(`Tools & Technologies: ${data.skills.tools}`));
            }

            paragraphs.push(this.createParagraph('', { spacing: 100 }));
        }

        // Projects
        if (data.projects.length > 0) {
            paragraphs.push(this.createSectionHeader('PROJECTS'));

            for (const proj of data.projects) {
                const titleLine = proj.technologies
                    ? `${proj.name} (${proj.technologies})`
                    : proj.name;
                paragraphs.push(this.createParagraph(titleLine, { bold: true }));

                if (proj.description) {
                    paragraphs.push(this.createParagraph(proj.description));
                }

                paragraphs.push(this.createParagraph('', { spacing: 80 }));
            }
        }

        // Certifications
        if (data.certifications.length > 0) {
            paragraphs.push(this.createSectionHeader('CERTIFICATIONS'));

            for (const cert of data.certifications) {
                const certLine = cert.issuer
                    ? `${cert.name} - ${cert.issuer}${cert.date ? ', ' + cert.date : ''}`
                    : cert.name;
                paragraphs.push(this.createBulletParagraph(certLine));
            }
        }

        return paragraphs.join('\n');
    },

    // Create a paragraph element
    createParagraph(text, options = {}) {
        const {
            bold = false,
            italic = false,
            fontSize = 22,
            centered = false,
            justify = false,
            spacing = 0
        } = options;

        let runProperties = '';
        if (bold) runProperties += '<w:b/>';
        if (italic) runProperties += '<w:i/>';
        runProperties += `<w:sz w:val="${fontSize}"/>`;
        runProperties += `<w:szCs w:val="${fontSize}"/>`;

        let alignment = '';
        if (centered) alignment = '<w:jc w:val="center"/>';
        if (justify) alignment = '<w:jc w:val="both"/>';

        let spacingXml = '';
        if (spacing > 0) {
            spacingXml = `<w:spacing w:after="${spacing}"/>`;
        }

        return `
    <w:p>
      <w:pPr>
        ${alignment}
        ${spacingXml}
      </w:pPr>
      <w:r>
        <w:rPr>${runProperties}</w:rPr>
        <w:t xml:space="preserve">${this.escapeXml(text)}</w:t>
      </w:r>
    </w:p>`;
    },

    // Create a section header
    createSectionHeader(text) {
        return `
    <w:p>
      <w:pPr>
        <w:pBdr>
          <w:bottom w:val="single" w:sz="6" w:space="1" w:color="auto"/>
        </w:pBdr>
        <w:spacing w:before="200" w:after="100"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="24"/>
          <w:szCs w:val="24"/>
        </w:rPr>
        <w:t>${this.escapeXml(text)}</w:t>
      </w:r>
    </w:p>`;
    },

    // Create a two-column paragraph (left and right aligned)
    createTwoColumnParagraph(leftText, rightText, options = {}) {
        const { italic = false } = options;
        let runProperties = italic ? '<w:i/>' : '';
        runProperties += '<w:sz w:val="20"/><w:szCs w:val="20"/>';

        return `
    <w:p>
      <w:r>
        <w:rPr>${runProperties}</w:rPr>
        <w:t>${this.escapeXml(leftText)}</w:t>
      </w:r>
      <w:r>
        <w:rPr>${runProperties}</w:rPr>
        <w:tab/>
        <w:t>${this.escapeXml(rightText)}</w:t>
      </w:r>
    </w:p>`;
    },

    // Create a bullet point paragraph
    createBulletParagraph(text) {
        return `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="ListParagraph"/>
        <w:numPr>
          <w:ilvl w:val="0"/>
          <w:numId w:val="1"/>
        </w:numPr>
        <w:ind w:left="720"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="20"/>
          <w:szCs w:val="20"/>
        </w:rPr>
        <w:t xml:space="preserve">${this.escapeXml(text)}</w:t>
      </w:r>
    </w:p>`;
    },

    // Create DOCX blob
    async createDOCXBlob(content, name) {
        // Create a simplified HTML-to-DOCX conversion
        // For production, you'd use a library like docx.js
        const htmlContent = this.convertToHTML(content, name);

        // For now, we'll use a workaround - create HTML that Word can open
        const blob = new Blob([htmlContent], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });

        return blob;
    },

    // Convert to HTML that Word can import
    convertToHTML(xmlContent, name) {
        // Parse the XML content back to readable format
        const formatted = this.parseXMLToHTML(xmlContent);

        return `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>${name} - Resume</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        @page { margin: 1in; }
        body { 
            font-family: 'Calibri', sans-serif; 
            font-size: 11pt;
            line-height: 1.15;
            color: #000;
        }
        h1 { 
            font-size: 18pt; 
            text-align: center; 
            margin-bottom: 5pt;
            text-transform: uppercase;
            letter-spacing: 2pt;
        }
        .contact { 
            text-align: center; 
            font-size: 10pt; 
            color: #333;
            margin-bottom: 12pt;
        }
        h2 { 
            font-size: 11pt; 
            text-transform: uppercase;
            border-bottom: 1pt solid #000;
            padding-bottom: 2pt;
            margin-top: 12pt;
            margin-bottom: 6pt;
        }
        .entry-title { font-weight: bold; }
        .entry-meta { font-style: italic; font-size: 10pt; color: #333; }
        ul { margin: 6pt 0; padding-left: 20pt; }
        li { margin-bottom: 3pt; font-size: 10pt; }
        p { margin: 3pt 0; }
        .summary { text-align: justify; }
    </style>
</head>
<body>
${formatted}
</body>
</html>`;
    },

    // Parse XML-like content back to HTML
    parseXMLToHTML(xmlContent) {
        // This is a simplified parser for our specific format
        let html = xmlContent;

        // Convert our XML paragraphs to HTML
        html = html.replace(/<w:p>[\s\S]*?<\/w:p>/g, (match) => {
            // Extract text content
            const textMatch = match.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g);
            if (!textMatch) return '';

            let text = textMatch.map(t =>
                t.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '')
            ).join(' ');

            // Check for formatting
            const isBold = match.includes('<w:b/>');
            const isItalic = match.includes('<w:i/>');
            const isCentered = match.includes('w:val="center"');
            const isHeader = match.includes('w:pBdr');
            const isBullet = match.includes('w:numPr');

            // Check font size
            const sizeMatch = match.match(/<w:sz w:val="(\d+)"/);
            const fontSize = sizeMatch ? parseInt(sizeMatch[1]) / 2 : 11;

            text = this.unescapeXml(text);

            if (fontSize >= 16) {
                return `<h1>${text}</h1>`;
            }

            if (isHeader) {
                return `<h2>${text}</h2>`;
            }

            if (isBullet) {
                return `<li>${text}</li>`;
            }

            let result = text;
            if (isBold) result = `<strong>${result}</strong>`;
            if (isItalic) result = `<em>${result}</em>`;

            if (isCentered) {
                return `<p style="text-align: center;">${result}</p>`;
            }

            return `<p>${result}</p>`;
        });

        // Wrap consecutive li elements in ul
        html = html.replace(/(<li>[\s\S]*?<\/li>\s*)+/g, (match) => {
            return `<ul>${match}</ul>`;
        });

        return html;
    },

    // Escape XML special characters
    escapeXml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    },

    // Unescape XML special characters
    unescapeXml(text) {
        if (!text) return '';
        return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");
    },

    // Download blob as file
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// Make available globally
window.ExportDOCX = ExportDOCX;
