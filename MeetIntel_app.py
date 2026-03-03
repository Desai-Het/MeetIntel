from flask import Flask, render_template, request, jsonify, send_file, session
from extractor import run_extraction
from exporter import generate_markdown
import io
import json
import os

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


@app.route("/export")
def export():
    raw = session.get("last_extraction")
    if not raw:
        return "No data to export. Please analyze a transcript first.", 400

    data = json.loads(raw)
    md_content = generate_markdown(data)

    buf = io.BytesIO()
    buf.write(md_content.encode("utf-8"))
    buf.seek(0)

    return send_file(
        buf,
        mimetype="text/markdown",
        as_attachment=True,
        download_name="transcript_summary.md"
    )


if __name__ == "__main__":
    app.run(debug=True, port=5001)
