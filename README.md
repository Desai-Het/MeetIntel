# ◈ MeetIntel

**MeetIntel** is an intelligent meeting assistant that transforms messy interview and meeting transcripts into structured, actionable intelligence. It automatically identifies speakers, extracts key decisions, assigns action items, and generates personalized summaries that can be emailed directly to attendees.

---

## ✨ Key Features

- **Automated Extraction**: Uses Google's `LangExtract` (Gemini-powered) to identify:
  - **Speakers**: Participates and their specific roles.
  - **Topics**: Key themes and their level of importance.
  - **Decisions**: Formal conclusions reached.
  - **Action Items**: Explicit tasks with assigned owners and deadlines.
- **Interactive Visualization**: A side-by-side view highlighting extracted entities directly within the transcript text.
- **AI-Powered Summarization**: Generates person-specific summaries using OpenAI's **GPT-4o-mini**, focusing only on what each participant needs to know.
- **Seamless Distribution**: A built-in email module to send these personalized summaries to attendees via SMTP.
- **Premium Design**: A high-end, editorial dark-themed interface with smooth transitions and real-time progress feedback.

---

## 🛠️ Technology Stack

- **Backend**: Python / Flask
- **Extraction Engine**: [Google LangExtract](https://github.com/google/langextract)
- **AI Logic**: OpenAI API (GPT-4o-mini)
- **Frontend**: Vanilla JavaScript (ES6+), CSS3 (Modern Ink aesthetic), HTML5
- **Communication**: SMTP (Secure email delivery)

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or higher
- An OpenAI API Key
- A Google Gemini / LangExtract API Key
- SMTP credentials (e.g., Gmail App Password)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd MeetIntel
    ```

2.  **Create a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

### Configuration

Create a `.env` file in the root directory and add your credentials:

```env
# API Keys
LANGEXTRACT_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Email Settings (SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Running the Application

Start the Flask development server:

```bash
python MeetIntel_app.py
```

Open your browser and navigate to `http://127.0.0.1:5001`.

---

## 📁 Project Structure

- `MeetIntel_app.py`: Main Flask application and API routes.
- `extractor.py`: Logic for data extraction using LangExtract.
- `exporter.py`: Utility to generate Markdown summaries.
- `static/`:
  - `script.js`: Frontend logic, UI transitions, and API handling.
  - `style.css`: Modern, editorial design system.
- `templates/`:
  - `index.html`: Transcript input and landing page.
  - `results.html`: Interactive dashboard and visualization.
- `test_output/`: Storage for processed extraction results and visualizations.

---

## 📄 License

This project is licensed under the Apache License 2.0.
