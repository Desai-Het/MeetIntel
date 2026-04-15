from datetime import datetime


def generate_markdown(data: dict, original_text: str = "") -> str:
    """
    Generate a clean Markdown summary from the structured extraction data.
    """
    lines = []
    now = datetime.now().strftime("%B %d, %Y at %I:%M %p")

    lines.append("# Meeting / Interview Transcript Summary")
    lines.append(f"*Generated on {now}*\n")
    lines.append("---\n")

    # Speakers
    lines.append("## 🎤 Speakers")
    if data.get("speakers"):
        for s in data["speakers"]:
            role = s.get("role", "participant").title()
            count = s.get("mention_count", 0)
            lines.append(f"- **{s['name']}** — {role} *(mentioned {count}x)*")
    else:
        lines.append("- No speakers identified.")
    lines.append("")

    # Key Topics
    lines.append("## 💡 Key Topics")
    if data.get("topics"):
        for t in data["topics"]:
            importance = t.get("importance", "medium")
            lines.append(f"- {t['text']} *(importance: {importance})*")
    else:
        lines.append("- No key topics identified.")
    lines.append("")

    # Decisions
    lines.append("## ✅ Decisions Made")
    if data.get("decisions"):
        for i, d in enumerate(data["decisions"], 1):
            lines.append(f"{i}. \"{d['text']}\"")
            if d.get("made_by") and d["made_by"] != "unknown":
                lines.append(f"   - *Made by: {d['made_by']}*")
            if d.get("context"):
                lines.append(f"   - *Context: {d['context']}*")
    else:
        lines.append("- No decisions recorded.")
    lines.append("")

    # Action Items
    lines.append("## 📋 Action Items")
    if data.get("action_items"):
        for i, a in enumerate(data["action_items"], 1):
            owner = a.get("owner", "Unassigned")
            deadline = a.get("deadline", "Not specified")
            lines.append(f"{i}. {a['text']}")
            lines.append(f"   - **Owner:** {owner} | **Deadline:** {deadline}")
    else:
        lines.append("- No action items identified.")
    lines.append("")

    lines.append("---")
    lines.append(f"*Total entities extracted: {data.get('total_entities', 'N/A')}*")

    return "\n".join(lines)
