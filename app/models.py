from pydantic import BaseModel

class UserCreate(BaseMode):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    email: str
    hashed_password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str