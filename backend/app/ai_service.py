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
You are an AI learning assistant.

Generate a short learning summary and 5 multiple-choice quiz questions from this lecture.

Return ONLY valid JSON in this format:

{{
  "summary": "short summary here",
  "questions": [
    {{
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "answer": "correct answer text"
    }}
  ]
}}

Lecture:
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
        temperature=0.3
    )

    content = response.choices[0].message.content

    return json.loads(content)