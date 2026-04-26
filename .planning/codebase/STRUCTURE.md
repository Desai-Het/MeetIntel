# Directory Structure

```text
MeetIntel/
├── app/                    # Main application package
│   ├── services/           # Business logic and external service wrappers
│   │   ├── email_service.py      # SMTP interaction
│   │   ├── extraction_service.py   # AI processing logic
│   │   └── summary_service.py      # Content generation
│   ├── utils/              # Helper utilities
│   │   └── exporter.py     # Result formatting
│   ├── routes.py           # Flask route definitions
│   ├── config.py           # Application configuration
│   └── __init__.py         # App factory and blueprint registration
├── static/                 # Static assets (CSS, JS, Images)
├── templates/              # HTML templates (Jinja2)
├── test_output/            # Scratched or logging outputs from tests/runs
├── .agent/                 # GSD and AI agent configuration
├── .planning/              # Project planning and codebase mapping (this)
├── requirements.txt        # Python dependencies
├── run.py                  # Local dev server entry point
├── vercel.json             # Vercel deployment config
└── vercel_app.py           # Vercel entry point
```

## Key Locations
- **Logic:** `app/services/`
- **UI:** `templates/` and `static/`
- **Config:** `.env` and `app/config.py`
- **Entry:** `run.py`
