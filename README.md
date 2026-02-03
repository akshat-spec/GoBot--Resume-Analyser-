# GoBot - AI Resume Optimizer 🤖

GoBot is a powerful, AI-driven tool designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS). It analyzes job descriptions, extracts key skills, and provides actionable suggestions to improve resume compatibility and visibility.

![Project Preview](https://img.shields.io/badge/Status-Active-brightgreen)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Flask](https://img.shields.io/badge/Framework-Flask-lightgrey)

## 🚀 Features

- **ATS Scoring Engine**: Get a real-time compatibility score based on keywords, formatting, and content quality.
- **Keyword Extraction**: Automatically identifies technical skills, soft skills, and action verbs from job descriptions.
- **Smart Optimization**: Suggests specific improvements and adds missing keywords to your resume summary and skill sections.
- **Multi-Format Support**: Upload resumes in PDF, DOCX, or plain text formats.
- **Resume Previewer**: Live, formatted preview of your optimized resume.
- **Export Options**: Export your optimized resume to PDF or DOCX (Beta).

## 🛠️ Technology Stack

### Backend
- **Python / Flask**: Robust RESTful API for resume parsing and optimization logic.
- **PyPDF2 / python-docx**: Advanced text extraction from various document formats.
- **CORS Support**: Seamless communication with the frontend.

### Frontend
- **HTML5 / CSS3**: Modern, responsive UI with glassmorphism elements.
- **Vanilla JavaScript**: Fast, dependency-free frontend logic for real-time interactions.
- **Modular Components**: Clean architecture with dedicated handlers for file uploads, form processing, and preview rendering.

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/akshat-spec/GoBot--Resume-Analyser-.git
   cd GoBot--Resume-Analyser-
   ```

2. **Setup virtual environment (Optional but Recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   python server.py
   ```
   The app will be available at `http://localhost:5000`.

## 📂 Project Structure

```text
GoBot/
├── css/                # Styling (Modern & Cyberpunk themes)
├── js/
│   ├── components/     # UI Component handlers
│   └── utils/          # ATS logic, exporters, and optimizers
├── uploads/            # Temporary storage for file processing
├── index.html          # Main application entry point
├── server.py           # Flask backend & API routes
└── requirements.txt    # Python dependencies
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve GoBot.

## 📄 License

This project is open-source. Please attribute the author when using or modifying.

---
Built with ❤️ by [Akshat Spec](https://github.com/akshat-spec)
