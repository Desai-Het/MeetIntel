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
    from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception

    # Function to check if the error is a 503 / High Demand
    def is_retryable(exception):
        msg = str(exception).lower()
        return "503" in msg or "high demand" in msg or "unavailable" in msg

    @retry(
        retry=retry_if_exception(is_retryable),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=2, min=2, max=10),
        reraise=True
    )
    def call_lx_extract():
        return lx.extract(
            text_or_documents=text,
            prompt_description=PROMPT,
            examples=EXAMPLES,
            model_id="gemini-1.5-flash-latest",
            extraction_passes=1,
            max_workers=1,
            max_char_buffer=8000
        )

    try:
        result = call_lx_extract()
        is_demo = False
    except Exception as e:
        # EMERGENCY FALLBACK: Load sample data if API is down
        print(f"DEBUG: Gemini API failed persistently. Entering Showcase Fallback Mode. Error: {e}")
        return get_demo_fallback_data()

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
    structured["is_demo"] = is_demo

    return structured


def get_demo_fallback_data():
    """Returns high-quality hardcoded results for showcase demo if API is down."""
    return {
        "speakers": [
            {"name": "Sarah", "role": "Project Lead", "mention_count": 2},
            {"name": "Priya", "role": "Team Member", "mention_count": 1}
        ],
        "topics": [
            {"text": "Project Phoenix", "importance": "high"},
            {"text": "initial scope", "importance": "high"},
            {"text": "milestones", "importance": "high"},
            {"text": "deliverables for the Q3 launch", "importance": "high"}
        ],
        "decisions": [
            {"text": "We want to reduce drop-off by 15%.", "made_by": "Sarah", "context": "user onboarding flow"}
        ],
        "action_items": [
            {"text": "Send updated roadmap by Friday", "owner": "Sarah", "deadline": "Friday"}
        ],
        "total_entities": 7,
        "is_demo": True,
        "visualization_html": """<style>.lx-highlight { position: relative; border-radius:3px; padding:1px 2px; color: #000 !important; font-weight: 500; } .lx-highlight .lx-tooltip { visibility: hidden; opacity: 0; transition: opacity 0.2s ease-in-out; background: #333; color: #fff; text-align: left; border-radius: 4px; padding: 6px 8px; position: absolute; z-index: 1000; bottom: 125%; left: 50%; transform: translateX(-50%); font-size: 12px; max-width: 240px; white-space: normal; box-shadow: 0 2px 6px rgba(0,0,0,0.3); } .lx-highlight:hover .lx-tooltip { visibility: visible; opacity:1; } .lx-animated-wrapper { max-width: 100%; font-family: Arial, sans-serif; background: #0f0f0f; color: #fff; height: 100vh; display: flex; flex-direction: column; } .lx-controls { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 12px; margin: 16px; } .lx-button-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 12px; } .lx-control-btn { background: #d4af37; color: #000; border: none; border-radius: 4px; padding: 8px 16px; cursor: pointer; font-size: 13px; font-weight: 500; } .lx-text-window { font-family: monospace; white-space: pre-wrap; border: 1px solid #333; padding: 22px; flex-grow: 1; overflow-y: auto; margin: 0 16px; line-height: 1.8; background: #111; color: #eee; font-size: 15px; } .lx-attributes-panel { background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 8px 10px; margin: 16px; font-size: 13px; } .lx-current-highlight { border: 2px solid #fff; box-shadow: 0 0 10px rgba(212, 175, 55, 0.5); } .lx-legend { font-size: 12px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #333; } .lx-label { display: inline-block; padding: 2px 4px; border-radius: 3px; margin-right: 4px; color: #000; }</style><div class='lx-animated-wrapper'><div class='lx-attributes-panel'><div style='color:#d4af37; font-weight:bold; margin-bottom:5px;'>✨ SHOWCASE STABLE MODE</div><div class='lx-legend'>Legend: <span class='lx-label' style='background-color:#D2E3FC;'>decision</span> <span class='lx-label' style='background-color:#C8E6C9;'>speaker</span> <span class='lx-label' style='background-color:#FEF0C3;'>topic</span></div><div id='attributesContainer'></div></div><div class='lx-text-window' id='textWindow'><span class='lx-highlight lx-current-highlight' data-idx='0' style='background-color:#C8E6C9;'>Sarah</span>: Thanks everyone for jumping on. I wanted to formally kick off <span class='lx-highlight' data-idx='1' style='background-color:#FEF0C3;'>Project Phoenix</span>. The goal of this meeting is to align on the <span class='lx-highlight' data-idx='2' style='background-color:#FEF0C3;'>initial scope</span>, set <span class='lx-highlight' data-idx='3' style='background-color:#FEF0C3;'>milestones</span>, and ensure we're all on the same page regarding <span class='lx-highlight' data-idx='4' style='background-color:#FEF0C3;'>deliverables for the Q3 launch</span>.\r\n<span class='lx-highlight' data-idx='5' style='background-color:#C8E6C9;'>Priya</span>: Just to confirm, the core objective is to <span class='lx-highlight' data-idx='6' style='background-color:#FEF0C3;'>overhaul the user onboarding flow</span>, right?\r\nSarah: Yes, exactly. <span class='lx-highlight' data-idx='7' style='background-color:#D2E3FC;'>We want to reduce drop-off by 15%.</span></div><div class='lx-controls'><div class='lx-button-row'><button class='lx-control-btn' onclick='nextExtraction()'>Next Highlight ⏭</button></div><div style='text-align:center; font-size:11px; color:#555; margin-top:8px;'>Offline Demo Redundancy Mode</div></div></div><script>(function(){const extractions=[{index:0,attributesHtml:\"<div><strong>class:</strong> speaker</div><div><strong>role:</strong> Project Lead</div>\"},{index:1,attributesHtml:\"<div><strong>class:</strong> topic</div><div><strong>importance:</strong> high</div>\"},{index:2,attributesHtml:\"<div><strong>class:</strong> topic</div><div><strong>importance:</strong> high</div>\"},{index:3,attributesHtml:\"<div><strong>class:</strong> topic</div><div><strong>importance:</strong> high</div>\"},{index:4,attributesHtml:\"<div><strong>class:</strong> topic</div><div><strong>importance:</strong> high</div>\"},{index:5,attributesHtml:\"<div><strong>class:</strong> speaker</div><div><strong>role:</strong> Team Member</div>\"},{index:6,attributesHtml:\"<div><strong>class:</strong> topic</div><div><strong>importance:</strong> high</div>\"},{index:7,attributesHtml:\"<div><strong>class:</strong> decision</div><div><strong>context:</strong> onboarding</div>\"}];let curr=0;window.nextExtraction=function(){curr=(curr+1)%extractions.length;document.getElementById('attributesContainer').innerHTML=extractions[curr].attributesHtml;document.querySelectorAll('.lx-highlight').forEach(el=>el.classList.remove('lx-current-highlight'));const active=document.querySelector('.lx-highlight[data-idx=\"'+curr+'\"]');if(active){active.classList.add('lx-current-highlight');active.scrollIntoView({block:'center',behavior:'smooth'});}};window.nextExtraction();})();</script>"""
    }


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
