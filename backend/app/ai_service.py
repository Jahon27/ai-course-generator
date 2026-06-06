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
    You are an educational quiz generator.

    Create exactly 5 multiple-choice questions from the lesson text.

    Return ONLY valid JSON in this format:

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

    Rules:
    - Options must be full meaningful answer texts.
    - Do NOT use only letters like A, B, C, D.
    - Do NOT include markdown.
    - Do NOT include explanations.
    - The answer must exactly match one option.
    - Make questions practical and based only on the lesson text.

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
        temperature=0.3
    )

    content = response.choices[0].message.content

    return json.loads(content)