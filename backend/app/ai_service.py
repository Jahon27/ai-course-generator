import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


def generate_quiz_from_text(lecture_text: str):
    lecture_text = lecture_text[:6000]

    prompt = f"""
You are an expert educational assessment designer.

Create exactly 5 multiple-choice quiz questions from the lesson text.

Return ONLY valid JSON. No markdown. No explanations.

Required JSON format:
{{
  "summary": "short lesson summary",
  "questions": [
    {{
      "question": "Clear question text",
      "options": [
        "Full answer option 1",
        "Full answer option 2",
        "Full answer option 3",
        "Full answer option 4"
      ],
      "answer": "Full correct answer text"
    }}
  ]
}}

Strict rules:
- Create exactly 5 questions.
- Each question must have exactly 4 options.
- Every option must be a full meaningful answer, not a single letter.
- Do NOT use options like "A", "B", "C", "D".
- The correct answer must be copied EXACTLY from one of the options.
- Only one option should be correct.
- Do not create very simple arithmetic questions like "3 + 5".
- Questions should be medium difficulty.
- Prefer conceptual understanding, application, comparison, and scenario-based questions.
- Use the lesson text only.
- Do not invent facts that are not in the lesson.
- Avoid vague questions.
- Avoid duplicate questions.
- Avoid answers like "All of the above" or "None of the above".
- The quiz should test understanding, not memorization only.

Lesson text:
{lecture_text}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    content = response.choices[0].message.content
    data = json.loads(content)

    questions = data.get("questions", [])

    if len(questions) != 5:
        raise ValueError("AI did not generate exactly 5 questions")

    for question in questions:
        options = question.get("options", [])
        answer = question.get("answer")

        if len(options) != 4:
            raise ValueError("Each question must have exactly 4 options")

        if answer not in options:
            raise ValueError("Correct answer must exactly match one option")

        if any(option.strip() in ["A", "B", "C", "D"] for option in options):
            raise ValueError("Options cannot be only letters")

        if len(set(options)) != 4:
            raise ValueError("Options must be unique")

    return data