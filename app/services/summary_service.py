import json
from openai import OpenAI
from app.config import config

class SummaryService:
    def __init__(self):
        self.client = OpenAI(api_key=config.OPENAI_API_KEY)

    def generate_participant_summaries(self, extraction_data: dict) -> dict:
        speakers = extraction_data.get("speakers", [])
        actions = extraction_data.get("action_items", [])
        decisions = extraction_data.get("decisions", [])

        summaries = {}
        for speaker in speakers:
            name = speaker["name"]
            speaker_actions = [a for a in actions if a["owner"].lower() == name.lower()]
            
            prompt = f"""
            You are a professional meeting assistant. Generate a personalized summary for {name}.
            
            Context:
            - Decisions Made: {json.dumps(decisions)}
            - Action Items for {name}: {json.dumps(speaker_actions)}
            
            Required Format:
            1. A numbered list of action items specifically for {name}. Each item should be a short, clear task.
            2. Leave exactly one blank line after the list.
            3. A single concluding sentence starting with "Once completed, please ensure to..." which provides a logical follow-up instruction or supportive next step based on the meeting's context (decisions or general goals).
            
            Constraints:
            - NO headers like "Objective", "Action Items", or "Summary".
            - NO greeting (like "Hi {name}") and NO closing (like "Best regards").
            - If {name} has NO assigned action items, the numbered list should instead concisely list 1-2 key decisions they should be aware of.
            - Use professional, active language.
            """

            try:
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a helpful meeting assistant."},
                        {"role": "user", "content": prompt}
                    ]
                )
                summaries[name] = response.choices[0].message.content.strip()
            except Exception as e:
                summaries[name] = f"Could not generate summary: {str(e)}"
        
        return summaries

summary_service = SummaryService()
