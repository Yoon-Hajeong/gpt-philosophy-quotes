from fastapi import FastAPI, HTTPException, Cookie, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import requests

# ================== 로그인 기능 영역 ==================
from .models import UserCreate, UserLogin, UserResponse
from .auth import create_user, authenticate_user, create_session, get_current_user, logout_user

user_router = APIRouter()

@user_router.get("/")
async def 홈페이지():
    return {"message": "안녕하세요! 로그인 시스템에 오신 것을 환영합니다! 🎉"}

@user_router.post("/register")
async def 회원가입(user_data: UserCreate):
    result = create_user(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    user_response = UserResponse(
        id=result["user"].id,
        username=result["user"].username,
        email=result["user"].email
    )
    return {
        "message": "🎉 회원가입이 완료되었습니다!",
        "user": user_response
    }

@user_router.post("/login")
async def 로그인(user_data: UserLogin):
    user = authenticate_user(user_data.username, user_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="❌ 사용자명 또는 비밀번호가 올바르지 않습니다")
    session_id = create_session(user_data.username)
    response = JSONResponse({
        "message": "🎉 로그인 성공!",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    })
    response.set_cookie(key="session_id", value=session_id, httponly=True, max_age=3600)
    return response

@user_router.get("/me")
async def 내정보보기(session_id: Optional[str] = Cookie(None)):
    if not session_id:
        raise HTTPException(status_code=401, detail="🚫 로그인이 필요합니다")
    user = get_current_user(session_id)
    if not user:
        raise HTTPException(status_code=401, detail="🚫 유효하지 않은 세션입니다. 다시 로그인해주세요")
    return UserResponse(id=user.id, username=user.username, email=user.email)

@user_router.post("/logout")
async def 로그아웃(session_id: Optional[str] = Cookie(None)):
    if session_id:
        logout_user(session_id)
    response = JSONResponse({"message": "👋 로그아웃되었습니다"})
    response.delete_cookie("session_id")
    return response

@user_router.get("/users")
async def 전체사용자목록():
    from auth import users_db
    return {
        "총_사용자_수": len(users_db),
        "사용자_목록": [
            {"id": user.id, "username": user.username, "email": user.email}
            for user in users_db.values()
        ]
    }

# ================== GPT 명언 기능 영역 ==================
class MoodInput(BaseModel):
    mood: str

gpt_router = APIRouter()

@gpt_router.post("/chat/philosophy")
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

# ================== FastAPI 앱 정의 ==================
app = FastAPI(title="로그인 + GPT 철학 명언 시스템")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(user_router)
app.include_router(gpt_router)

# 실행
if __name__ == "__main__":
    import uvicorn
    print("🌐 서버를 시작합니다...")
    print("📱 http://localhost:8000 에 접속하세요!")
    uvicorn.run(app, host="0.0.0.0", port=8000)
