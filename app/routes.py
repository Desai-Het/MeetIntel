import json
from flask import Blueprint, render_template, request, jsonify, session
from app.services.extraction_service import run_extraction
from app.services.summary_service import summary_service
from app.services.email_service import email_service

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def index():
    return render_template("index.html")

@main_bp.route("/results")
def results():
    return render_template("results.html")

@main_bp.route("/analyze", methods=["POST"])
def analyze():
    text = ""
    if "file" in request.files and request.files["file"].filename:
        try:
            text = request.files["file"].read().decode("utf-8")
        except:
            return jsonify({"error": "Could not read file."}), 400
    elif request.form.get("transcript_text"):
        text = request.form.get("transcript_text", "").strip()

    if not text:
        return jsonify({"error": "No transcript provided."}), 400

    try:
        data = run_extraction(text)
        session["last_extraction"] = json.dumps({k: v for k, v in data.items() if k != "visualization_html"})
        return jsonify({
            "success": True, 
            "data": {k: v for k, v in data.items() if k != "visualization_html"},
            "visualization_html": data.get("visualization_html", "")
        })
    except Exception as e:
        return jsonify({"error": f"Extraction failed: {str(e)}"}), 500

@main_bp.route("/summarize", methods=["POST"])
def summarize():
    raw_data = session.get("last_extraction")
    if not raw_data:
        return jsonify({"error": "No extraction data found."}), 400

    try:
        data = json.loads(raw_data)
        summaries = summary_service.generate_participant_summaries(data)
        session["speaker_summaries"] = json.dumps(summaries)
        return jsonify({"success": True, "summaries": summaries})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main_bp.route("/send-emails", methods=["POST"])
def send_emails():
    summaries_raw = session.get("speaker_summaries")
    if not summaries_raw:
        return jsonify({"error": "No summaries found."}), 400

    recipients = request.json.get("recipients", {})
    try:
        summaries = json.loads(summaries_raw)
        sent_count = email_service.send_summaries(recipients, summaries)
        return jsonify({"success": True, "message": f"Successfully sent {sent_count} emails."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
