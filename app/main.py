from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests



app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MoodInput(BaseModel):
    mood: str

@app.post("/chat/philosophy")
def get_quote(data: MoodInput):
    messages = [
        {
            "role": "system",
            "content": "assistant는 감정에 맞는 철학자 명언을 한국어와 영어로 제공하는 지혜로운 철학자다."
        },

        {
            "role": "user",
            "content": f"오늘 나는 '{data.mood}' 기분이야. 그 기분에 맞는 철학 명언을 **첫 줄은 한국어, 두 번째 줄은 영어로만** 알려줘."


        }
    ]


    response = requests.post(
    "https://dev.wenivops.co.kr/services/openai-api",
        json=messages
    )

    result = response.json()
    return {
        "quote": result["choices"][0]["message"]["content"]
    }
