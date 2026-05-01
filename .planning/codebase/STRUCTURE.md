# Project Structure - MeetIntel

```text
MeetIntel/
├── app/                        # Main application package
│   ├── services/               # Business logic services
│   │   ├── email_service.py    # Email distribution logic
│   │   ├── extraction_service.py # AI extraction (Gemini + lx)
│   │   └── summary_service.py  # Participant summarization
│   ├── utils/                  # Shared helper functions
│   ├── __init__.py             # App factory (create_app)
│   ├── config.py               # Config management
│   └── routes.py               # Blueprint-based routes
├── static/                     # CSS, JS, and image assets
├── templates/                  # Jinja2 HTML templates
│   ├── index.html              # Landing page / Upload
│   └── results.html            # Analysis visualization
├── .planning/                  # GSD Project Management
│   └── codebase/               # Intelligence documents
├── .agent/                     # GSD Skills and Workflows
├── test_output/                # Local ephemeral output
├── .env                        # Local environment secrets
├── advance.py                  # Advanced experimental runner
├── basic.py                    # Simple experimental runner
├── requirements.txt            # Python dependencies
├── run.py                      # Local development entry point
├── vercel.json                 # Vercel deployment config
└── vercel_app.py               # Vercel-specific entry point
```

## Key Directories

### `/app`
The core of the application. Strictly follows the separation of routes and services.

### `/static` & `/templates`
Contains the UI layer. Templates are located in the root to accommodate Vercel's standard deployment structure while being referenced by the Flask factory.

### `/.planning`
Crucial for AI-assisted development. Contains the codebase map and project state.

### `/.agent`
Contains the `gsd-` skill set that powers automated development workflows.
