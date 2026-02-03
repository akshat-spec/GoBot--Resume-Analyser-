/**
 * GoBot - File Upload Handler
 * Handles resume file uploads with drag-and-drop support
 */

const FileUpload = {
    selectedFile: null,
    parsedResume: null,

    // Initialize file upload handlers
    init() {
        this.initDropZone();
        this.initFileInput();
        this.initRemoveButton();
    },

    // Initialize drag-and-drop zone
    initDropZone() {
        const zone = document.getElementById('fileUploadZone');
        if (!zone) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
            zone.addEventListener(event, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Highlight on drag
        ['dragenter', 'dragover'].forEach(event => {
            zone.addEventListener(event, () => {
                zone.classList.add('drag-over');
            });
        });

        // Remove highlight on leave/drop
        ['dragleave', 'drop'].forEach(event => {
            zone.addEventListener(event, () => {
                zone.classList.remove('drag-over');
            });
        });

        // Handle drop
        zone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });
    },

    // Initialize file input
    initFileInput() {
        const fileInput = document.getElementById('resumeFile');
        if (!fileInput) return;

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });
    },

    // Initialize remove button
    initRemoveButton() {
        const removeBtn = document.getElementById('removeFile');
        if (!removeBtn) return;

        removeBtn.addEventListener('click', () => {
            this.clearFile();
        });
    },

    // Handle selected file
    async handleFile(file) {
        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
        const validExtensions = ['pdf', 'docx', 'doc', 'txt'];

        const ext = file.name.split('.').pop().toLowerCase();

        if (!validExtensions.includes(ext)) {
            App.showToast('Invalid file type. Please upload PDF, DOCX, DOC, or TXT files.', 'error');
            return;
        }

        // Validate file size (16MB max)
        if (file.size > 16 * 1024 * 1024) {
            App.showToast('File too large. Maximum size is 16MB.', 'error');
            return;
        }

        this.selectedFile = file;
        this.showSelectedFile(file);

        // Try to upload and parse
        await this.uploadAndParse(file);
    },

    // Show selected file info
    showSelectedFile(file) {
        const zone = document.getElementById('fileUploadZone');
        const selected = document.getElementById('fileSelected');
        const fileName = document.getElementById('selectedFileName');

        if (zone && selected && fileName) {
            zone.classList.add('hidden');
            selected.classList.remove('hidden');
            fileName.textContent = file.name;
        }
    },

    // Upload and parse file
    async uploadAndParse(file) {
        const status = document.getElementById('uploadStatus');
        const statusText = document.getElementById('uploadStatusText');
        const progress = document.getElementById('fileProgress');

        // Show status
        if (status) {
            status.classList.remove('hidden');
        }

        if (statusText) {
            statusText.textContent = 'Uploading and parsing resume...';
        }

        if (progress) {
            progress.style.width = '0%';
            // Animate progress
            let width = 0;
            const interval = setInterval(() => {
                if (width < 90) {
                    width += 10;
                    progress.style.width = width + '%';
                }
            }, 200);

            try {
                // Check if backend is available
                const backendAvailable = await API.isBackendAvailable();

                if (backendAvailable) {
                    // Use backend for parsing
                    this.parsedResume = await API.uploadResume(file);

                    clearInterval(interval);
                    progress.style.width = '100%';

                    if (this.parsedResume && !this.parsedResume.error) {
                        statusText.textContent = 'Resume parsed successfully!';

                        // Fill the textarea with raw text
                        const textarea = document.getElementById('existingResume');
                        if (textarea) {
                            if (this.parsedResume.rawText) {
                                textarea.value = this.parsedResume.rawText;
                            } else {
                                // Fallback: if rawText is missing, try to reconstruct it or at least fill something
                                textarea.value = this.reconstructRawText(this.parsedResume);
                            }

                            // Trigger input event so other listeners know it changed
                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                            textarea.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        setTimeout(() => {
                            status.classList.add('hidden');
                        }, 2000);

                        App.showToast('Resume uploaded and parsed successfully!', 'success');
                    } else {
                        console.error('Parsed resume error:', this.parsedResume);
                        throw new Error(this.parsedResume?.error || 'Failed to parse resume');
                    }
                } else {
                    // Fall back to client-side text file reading
                    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                        const text = await this.readTextFile(file);

                        clearInterval(interval);
                        progress.style.width = '100%';

                        // Fill the textarea
                        const textarea = document.getElementById('existingResume');
                        if (textarea) {
                            textarea.value = text;
                        }

                        statusText.textContent = 'Text file loaded!';

                        setTimeout(() => {
                            status.classList.add('hidden');
                        }, 2000);

                        App.showToast('Text file loaded successfully!', 'success');
                    } else {
                        throw new Error('PDF/DOCX parsing requires the Python server. Start it with: python server.py');
                    }
                }

            } catch (error) {
                clearInterval(interval);
                progress.style.width = '100%';
                progress.style.backgroundColor = 'var(--error)';

                statusText.textContent = error.message;

                setTimeout(() => {
                    status.classList.add('hidden');
                    progress.style.backgroundColor = '';
                }, 3000);

                App.showToast(error.message, 'error');
            }
        }
    },

    // Read text file
    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    },

    // Reconstruct raw text from parsed data if rawText is missing
    reconstructRawText(data) {
        if (!data) return '';

        let text = '';
        if (data.fullName) text += data.fullName + '\n';
        if (data.email || data.phone) text += `${data.email || ''} ${data.phone || ''}\n\n`;
        if (data.summary) text += 'SUMMARY\n' + data.summary + '\n\n';

        if (data.experience && data.experience.length > 0) {
            text += 'EXPERIENCE\n';
            data.experience.forEach(exp => {
                text += `${exp.title || ''} at ${exp.company || ''}\n`;
                if (exp.bullets) exp.bullets.forEach(b => text += `• ${b}\n`);
                text += '\n';
            });
        }

        if (data.education && data.education.length > 0) {
            text += 'EDUCATION\n';
            data.education.forEach(edu => {
                text += `${edu.degree || ''} from ${edu.school || ''} (${edu.graduationDate || ''})\n`;
            });
        }

        if (data.technicalSkills) text += '\nSKILLS\n' + data.technicalSkills + '\n';

        return text;
    },

    // Clear selected file
    clearFile() {
        this.selectedFile = null;
        this.parsedResume = null;

        const zone = document.getElementById('fileUploadZone');
        const selected = document.getElementById('fileSelected');
        const fileInput = document.getElementById('resumeFile');
        const status = document.getElementById('uploadStatus');

        if (zone) zone.classList.remove('hidden');
        if (selected) selected.classList.add('hidden');
        if (fileInput) fileInput.value = '';
        if (status) status.classList.add('hidden');
    },

    // Get parsed resume data
    getParsedResume() {
        return this.parsedResume;
    },

    // Check if file is selected
    hasFile() {
        return this.selectedFile !== null;
    }
};

// Make available globally
window.FileUpload = FileUpload;
