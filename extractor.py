import langextract as lx
import textwrap
from collections import defaultdict
from dotenv import load_dotenv
load_dotenv()

# --- Prompt ---
PROMPT = textwrap.dedent("""\
    Extract speakers, key topics, decisions, and action items from the given meeting or interview transcript.

    Rules:
    - For speakers: use the exact name/label as it appears (e.g. "JOHN", "Interviewer", "Speaker 1").
    - For action items: extract the full sentence describing the task.
    - For decisions: extract the exact phrase or sentence stating what was decided.
    - For topics: extract the noun phrase or short phrase naming the topic.
    - Use exact text from the input for extraction_text. Do not paraphrase.
    - Extract entities in order of appearance with no overlapping text spans.

    Note: Speaker names in transcripts often appear as ALL-CAPS or followed by a colon.""")

# --- Few-shot examples ---
EXAMPLES = [
    lx.data.ExampleData(
        text=textwrap.dedent("""\
            SARAH: I think we should move the launch to Q3. That gives us more runway.
            JAMES: Agreed. Also, can you send the updated roadmap by Friday?
            SARAH: Sure, I'll handle that. We also need to finalize the budget."""),
        extractions=[
            lx.data.Extraction(
                extraction_class="speaker",
                extraction_text="SARAH",
                attributes={"role": "decision maker", "mention_count": "2"}
            ),
            lx.data.Extraction(
                extraction_class="decision",
                extraction_text="move the launch to Q3",
                attributes={"made_by": "SARAH", "context": "more runway needed"}
            ),
            lx.data.Extraction(
                extraction_class="speaker",
                extraction_text="JAMES",
                attributes={"role": "team member", "mention_count": "1"}
            ),
            lx.data.Extraction(
                extraction_class="action_item",
                extraction_text="send the updated roadmap by Friday",
                attributes={"owner": "SARAH", "deadline": "Friday"}
            ),
            lx.data.Extraction(
                extraction_class="topic",
                extraction_text="finalize the budget",
                attributes={"importance": "high"}
            ),
        ]
    )
]


def run_extraction(text: str) -> dict:
    """
    Run LangExtract on the given transcript text.
    Returns a structured dict with speakers, topics, decisions, action_items,
    plus the raw HTML visualization string.
    """
    result = lx.extract(
        text_or_documents=text,
        prompt_description=PROMPT,
        examples=EXAMPLES,
        model_id="gemini-2.5-flash",
        extraction_passes=1,
        max_workers=1,
        max_char_buffer=8000
    )

    # Save JSONL for visualization in /tmp (Vercel compatible)
    import os
    out_dir = "/tmp" if os.name != "nt" else "test_output"
    os.makedirs(out_dir, exist_ok=True)
    jsonl_path = os.path.join(out_dir, "transcript_extractions.jsonl")
    
    lx.io.save_annotated_documents([result], output_name=jsonl_path)

    # Generate HTML visualization
    html_content = lx.visualize(jsonl_path)

    # Parse into structured buckets
    structured = _parse_extractions(result.extractions)
    structured["visualization_html"] = html_content
    structured["total_entities"] = len(result.extractions)

    return structured


def _parse_extractions(extractions) -> dict:
    speakers = {}
    topics = []
    decisions = []
    action_items = []

    for e in extractions:
        cls = e.extraction_class
        attrs = e.attributes or {}

        if cls == "speaker":
            name = e.extraction_text.strip()
            if name not in speakers:
                speakers[name] = {
                    "name": name,
                    "role": attrs.get("role", "participant"),
                    "mention_count": 0
                }
            # Try to parse mention_count from attributes
            try:
                speakers[name]["mention_count"] += int(attrs.get("mention_count", 1))
            except (ValueError, TypeError):
                speakers[name]["mention_count"] += 1

        elif cls == "topic":
            topics.append({
                "text": e.extraction_text.strip(),
                "importance": attrs.get("importance", "medium")
            })

        elif cls == "decision":
            decisions.append({
                "text": e.extraction_text.strip(),
                "made_by": attrs.get("made_by", "unknown"),
                "context": attrs.get("context", "")
            })

        elif cls == "action_item":
            action_items.append({
                "text": e.extraction_text.strip(),
                "owner": attrs.get("owner", "unassigned"),
                "deadline": attrs.get("deadline", "not specified")
            })

    return {
        "speakers": list(speakers.values()),
        "topics": topics,
        "decisions": decisions,
        "action_items": action_items
    }
