import hashlib
import uuid
from typing import Optional

users_db = {}
user_sessions = {}
next_user_id = 1

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(entered_password : str, hashed_password: str) -> bool:
    screened = hash_password(entered_password)
    return screened == hashed_password

def create_user(username: str, email: str, password: str) -> dict:
    global next_user_id

    if username in users_db:
        return {
            "success" : False,
            "message" : "이미 존재하는 사용자명입니다."
        }
    
    from .models import User
    new_user = User(
        id=next_user_id,
        username=username,
        email=email,
        hashed_password=hash_password(password)
    )

    users_db[username] = new_user
    next_user_id += 1

    return {"success": True, "user":new_user}

def authenticate_user(username: str, password: str) -> Optional[dict]:
    if username not in users_db:
        return None
    user = users_db[username]

    if not verify_password(password, user.hashed_password):
        return None
    return user

def create_session(username: str) -> str:
    session_id = str(uuid.uuid4())
    user_sessions[session_id] = username
    return session_id

def get_current_user(session_id: str) -> Optional[dict]:
    if session_id not in user_sessions:
        return None
    username = user_sessions[session_id]
    return users_db.get(username)

def logout_user(session_id: str):
    if session_id in user_sessions:
        del user_sessions[session_id]

