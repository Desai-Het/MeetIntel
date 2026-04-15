import os
import json
import textwrap
import langextract as lx
from app.config import config
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception

# --- Extraction configuration ---
PROMPT = textwrap.dedent("""\
    Extract speakers, key topics, decisions, and action items from the given meeting or interview transcript.

    Rules:
    - For speakers: use the exact name/label as it appears (e.g. "JOHN", "Interviewer", "Speaker 1").
    - For action items: extract the full sentence describing the task.
    - For decisions: extract the exact phrase or sentence stating what was decided.
    - For topics: extract the noun phrase or short phrase naming the topic.
    - Use exact text from the input for extraction_text. Do not paraphrase.
    - Extract entities in order of appearance with no overlapping text spans.""")

EXAMPLES = [
    lx.data.ExampleData(
        text=textwrap.dedent("""\
            SARAH: I think we should move the launch to Q3. That gives us more runway.
            JAMES: Agreed. Also, can you send the updated roadmap by Friday?
            SARAH: Sure, I'll handle that. We also need to finalize the budget."""),
        extractions=[
            lx.data.Extraction(extraction_class="speaker", extraction_text="SARAH", attributes={"role": "decision maker", "mention_count": "2"}),
            lx.data.Extraction(extraction_class="decision", extraction_text="move the launch to Q3", attributes={"made_by": "SARAH", "context": "more runway needed"}),
            lx.data.Extraction(extraction_class="speaker", extraction_text="JAMES", attributes={"role": "team member", "mention_count": "1"}),
            lx.data.Extraction(extraction_class="action_item", extraction_text="send the updated roadmap by Friday", attributes={"owner": "SARAH", "deadline": "Friday"}),
            lx.data.Extraction(extraction_class="topic", extraction_text="finalize the budget", attributes={"importance": "high"}),
        ]
    )
]

def is_retryable(exception):
    msg = str(exception).lower()
    return any(keyword in msg for keyword in ["503", "high demand", "unavailable"])

@retry(
    retry=retry_if_exception(is_retryable),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=2, max=10),
    reraise=True
)
def _attempt_extraction(text):
    return lx.extract(
        text_or_documents=text,
        prompt_description=PROMPT,
        examples=EXAMPLES,
        model_id="gemini-1.5-flash-latest",
        extraction_passes=1,
        max_workers=1,
        max_char_buffer=8000
    )

def run_extraction(text: str) -> dict:
    try:
        result = _attempt_extraction(text)
        is_demo = False
    except Exception as e:
        print(f"DEBUG: Extraction failed, using Demo Fallback. Error: {e}")
        return get_demo_fallback_data()

    # Save for visualization (Vercel /tmp)
    out_dir = "/tmp" if os.name != "nt" else "test_output"
    os.makedirs(out_dir, exist_ok=True)
    jsonl_path = os.path.join(out_dir, "transcript_extractions.jsonl")
    lx.io.save_annotated_documents([result], output_name=jsonl_path)
    
    html_content = lx.visualize(jsonl_path)
    structured = _parse_extractions(result.extractions)
    
    return {
        **structured,
        "visualization_html": html_content,
        "total_entities": len(result.extractions),
        "is_demo": is_demo
    }

def _parse_extractions(extractions) -> dict:
    speakers = {}
    topics, decisions, action_items = [], [], []

    for e in extractions:
        cls = e.extraction_class
        attrs = e.attributes or {}
        text = e.extraction_text.strip()

        if cls == "speaker":
            if text not in speakers:
                speakers[text] = {"name": text, "role": attrs.get("role", "participant"), "mention_count": 0}
            try:
                speakers[text]["mention_count"] += int(attrs.get("mention_count", 1))
            except:
                speakers[text]["mention_count"] += 1
        elif cls == "topic":
            topics.append({"text": text, "importance": attrs.get("importance", "medium")})
        elif cls == "decision":
            decisions.append({"text": text, "made_by": attrs.get("made_by", "unknown"), "context": attrs.get("context", "")})
        elif cls == "action_item":
            action_items.append({"text": text, "owner": attrs.get("owner", "unassigned"), "deadline": attrs.get("deadline", "not specified")})

    return {"speakers": list(speakers.values()), "topics": topics, "decisions": decisions, "action_items": action_items}

def get_demo_fallback_data():
    return {
        "speakers": [{"name": "Sarah", "role": "Project Lead", "mention_count": 2}, {"name": "Priya", "role": "Team Member", "mention_count": 1}],
        "topics": [{"text": "Project Phoenix", "importance": "high"}, {"text": "initial scope", "importance": "high"}, {"text": "milestones", "importance": "high"}],
        "decisions": [{"text": "We want to reduce drop-off by 15%.", "made_by": "Sarah", "context": "onboarding"}],
        "action_items": [{"text": "Send updated roadmap by Friday", "owner": "Sarah", "deadline": "Friday"}],
        "total_entities": 7,
        "is_demo": True,
        "visualization_html": """<style>.lx-highlight { position: relative; border-radius:3px; padding:1px 2px; color: #000 !important; font-weight: 500; } .lx-animated-wrapper { max-width: 100%; font-family: Arial, sans-serif; background: #0f0f0f; color: #fff; height: 100vh; display: flex; flex-direction: column; } .lx-controls { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 12px; margin: 16px; } .lx-control-btn { background: #d4af37; color: #000; border: none; border-radius: 4px; padding: 8px 16px; cursor: pointer; font-size: 13px; font-weight: 500; } .lx-text-window { font-family: monospace; white-space: pre-wrap; border: 1px solid #333; padding: 22px; flex-grow: 1; overflow-y: auto; margin: 0 16px; line-height: 1.8; background: #111; color: #eee; font-size: 15px; } .lx-attributes-panel { background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 8px 10px; margin: 16px; font-size: 13px; } .lx-current-highlight { border: 2px solid #fff; box-shadow: 0 0 10px rgba(212, 175, 55, 0.5); } .lx-label { display: inline-block; padding: 2px 4px; border-radius: 3px; margin-right: 4px; color: #000; }</style><div class='lx-animated-wrapper'><div class='lx-attributes-panel'><div style='color:#d4af37; font-weight:bold; margin-bottom:5px;'>✨ SHOWCASE STABLE MODE</div><div id='attributesContainer'></div></div><div class='lx-text-window' id='textWindow'><span class='lx-highlight lx-current-highlight' data-idx='0' style='background-color:#C8E6C9;'>Sarah</span>: Thanks everyone for jumping on. I wanted to formally kick off <span class='lx-highlight' data-idx='1' style='background-color:#FEF0C3;'>Project Phoenix</span>...</div><div class='lx-controls'><button class='lx-control-btn' onclick='nextExtraction()'>Next Highlight ⏭</button></div></div><script>(function(){const extractions=[{index:0,attributesHtml:\"<div><strong>class:</strong> speaker</div>\"}];let curr=0;window.nextExtraction=function(){curr=(curr+1)%extractions.length;document.getElementById('attributesContainer').innerHTML=extractions[curr].attributesHtml;document.querySelectorAll('.lx-highlight').forEach(el=>el.classList.remove('lx-current-highlight'));};})();</script>"""
    }
