from flask import Flask, render_template, request, jsonify, send_file, session
from extractor import run_extraction
from exporter import generate_markdown
import io
import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
app.secret_key = os.urandom(24)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    text = ""

    # Handle file upload
    if "file" in request.files and request.files["file"].filename:
        f = request.files["file"]
        try:
            text = f.read().decode("utf-8")
        except Exception:
            return jsonify({"error": "Could not read file. Please upload a plain .txt file."}), 400

    # Handle pasted text
    elif request.form.get("transcript_text"):
        text = request.form.get("transcript_text", "").strip()

    if not text:
        return jsonify({"error": "No transcript provided. Please paste text or upload a file."}), 400

    if len(text) > 50000:
        return jsonify({"error": "Transcript too long. Please keep it under 50,000 characters."}), 400

    try:
        data = run_extraction(text)
        # Store in session for export
        session["last_extraction"] = json.dumps({k: v for k, v in data.items() if k != "visualization_html"})
        session["last_text"] = text[:500]  # store snippet only
        return jsonify({"success": True, "data": {k: v for k, v in data.items() if k != "visualization_html"},
                        "visualization_html": data.get("visualization_html", "")})
    except Exception as e:
        return jsonify({"error": f"Extraction failed: {str(e)}"}), 500


@app.route("/results")
def results():
    return render_template("results.html")


@app.route("/summarize", methods=["POST"])
def summarize():
    raw_data = session.get("last_extraction")
    if not raw_data:
        return jsonify({"error": "No extraction data found. Please analyze a transcript first."}), 400

    data = json.loads(raw_data)
    # Get original text snippet or full text if available
    # In extractor.py we stored snippet, but we might need more context.
    # For now we use the structured data (actions, decisions) which is more reliable.
    
    speakers = data.get("speakers", [])
    actions = data.get("action_items", [])
    decisions = data.get("decisions", [])

    summaries = {}

    for speaker in speakers:
        name = speaker["name"]
        speaker_actions = [a for a in actions if a["owner"].lower() == name.lower()]
        
        prompt = f"""
        Generate a concise, professional summary for {name} based on the meeting results.
        
        Decisions Made: {json.dumps(decisions)}
        Action Items for {name}: {json.dumps(speaker_actions)}
        
        Focus on:
        1. What they need to do (Action Items).
        2. Deadlines for those tasks.
        3. Simple follow-up advice after completion.
        
        Keep it under 100 words. Format as a personalized message.
        """

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": "You are a helpful meeting assistant."},
                          {"role": "user", "content": prompt}]
            )
            summaries[name] = response.choices[0].message.content.strip()
        except Exception as e:
            summaries[name] = f"Could not generate summary: {str(e)}"

    session["speaker_summaries"] = json.dumps(summaries)
    return jsonify({"success": True, "summaries": summaries})


@app.route("/send-emails", methods=["POST"])
def send_emails():
    summaries_raw = session.get("speaker_summaries")
    if not summaries_raw:
        return jsonify({"error": "No summaries found. Please summarize first."}), 400

    summaries = json.loads(summaries_raw)
    recipients = request.json.get("recipients", {}) # { "SpeakerName": "email@example.com" }

    sent_count = 0
    for name, email in recipients.items():
        if email and name in summaries:
            # MOCK EMAIL SENDING
            print(f"--- SENDING EMAIL TO {email} ---")
            print(f"Subject: Your Meeting Summary - MeetIntel")
            print(f"Content: {summaries[name]}")
            print("---------------------------------")
            sent_count += 1

    if sent_count == 0:
        return jsonify({"error": "No valid email addresses provided."}), 400

    return jsonify({"success": True, "message": f"Successfully drafted/sent {sent_count} emails."})


if __name__ == "__main__":
    app.run(debug=True, port=5001)
