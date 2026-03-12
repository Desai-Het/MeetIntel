---
name: website-overview
description: Provides a comprehensive overview of the MeetIntel application, documenting its functionality, aesthetic theme, typography, and technical stack. This serves as a reference for future development and design consistency and defines what to take care of while creating new features or modifying existing ones.
---

# MeetIntel Website Overview Skill

## Description
This skill provides a comprehensive overview of the MeetIntel application, documenting its functionality, aesthetic theme, typography, and technical stack. This serves as a reference for future development and design consistency.

## Application Overview
MeetIntel is an AI-powered transcript analyzer that turns conversations into structured clarity. It allows users to paste or upload meeting transcripts and extracts key insights like speakers, topics, decisions, and action items.

### Core Functionality
- **Transcript Input**: Supports manual text pasting and `.txt` file uploads.
- **AI Extraction**: Uses Gemini 2.5 Flash via LangExtract to identify entities (speakers, decisions, etc.).
- **Interactive Dashboard**: Displays extracted entities in organized cards and tables.
- **Visual Highlighting**: Features an interactive, color-coded transcript view for easy navigation.
- **Data Export**: Allows downloading structured summaries as Markdown files.

## Design & Aesthetics
The website follows an **"Editorial Dark"** aesthetic, emphasizing premium quality and readability through refined typography and subtle textures.

### Color Palette
- **Background**: `#0F0E0D` (Deep Charcoal/Black)
- **Surface**: `#1A1815` / `#232018` (Warm Ebony)
- **Primary Accent**: `#D4A853` (Muted Gold) - Used for buttons, emphasized text, and active states.
- **Semantic Accents**:
  - **Speakers**: Blue/Cyan highlights.
  - **Decisions**: Green highlights.
  - **Topics**: Pink/Red highlights.
  - **Action Items**: Purple/Lilac highlights.

### Typography
- **Display**: `'DM Serif Display', Georgia, serif` - Used for primary headings and editorial flair.
- **Body**: `'DM Sans', system-ui, sans-serif` - Used for general UI text and descriptions.
- **Monospace**: `'DM Mono', 'Courier New', monospace` - Used for code-like elements, labels, and technical data.

### Visual Elements
- **Noise Texture**: A subtle SVG-based noise overlay (`noise` class) adds depth and a "paper/ink" feel to the dark background.
- **Transitions**: Smooth hover effects and fade-up animations for dashboard sections.
- **Backdrop Filters**: Headers use `backdrop-filter: blur(12px)` for a sophisticated glassmorphism effect.

## Technical Implementation
- **Backend**: Flask (Python)
- **AI Integration**: LangExtract with Gemini 2.5 Flash
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript
- **State Management**: Flask session for temporary data storage and export.

## What not to do
- Do not change the coding style of the web-application.

## Key Files
- `MeetIntel_app.py`: Main Flask server and route handlers.
- `extractor.py`: Logic for AI-driven entity extraction.
- `static/style.css`: Comprehensive design definition including CSS variables and theme tokens.
- `static/script.js`: Frontend interactivity for tabs, file uploads, and analysis results rendering.

![MeetIntel Homepage](file:///C:/Users/hetde/.gemini/antigravity/brain/5a9ec314-c72f-4288-9c1a-1cb63b01e514/homepage_screenshot_1773255829690.png)
![MeetIntel Results Page](file:///C:/Users/hetde/.gemini/antigravity/brain/5a9ec314-c72f-4288-9c1a-1cb63b01e514/results_screenshot_1773255875917.png)
