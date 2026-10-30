import time
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta
from collections import defaultdict
from app.database import get_db
from app.models.user import User
from app.schemas.auth import Token, UserLogin, UserCreate, UserResponse, RefreshTokenRequest
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_access_token
)
from app.core.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory sliding-window rate limiter for auth endpoints
# Limit: 15 requests per 60 seconds per client IP
AUTH_RATE_LIMIT = 15
AUTH_WINDOW_SECONDS = 60
_auth_request_history = defaultdict(list)

def check_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    history = _auth_request_history[client_ip]
    
    # Filter out entries older than window
    _auth_request_history[client_ip] = [t for t in history if now - t < AUTH_WINDOW_SECONDS]
    
    if len(_auth_request_history[client_ip]) >= AUTH_RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded for authentication requests. Please try again after 60 seconds."
        )
    _auth_request_history[client_ip].append(now)

@router.post("/login", response_model=Token)
async def login(request: Request, login_data: UserLogin, db: Session = Depends(get_db)):
    check_rate_limit(request)
    
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is inactive")

    access_token = create_access_token(
        subject=user.email,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(subject=user.email, role=user.role)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh", response_model=Token)
async def refresh_access_token(request: Request, refresh_req: RefreshTokenRequest, db: Session = Depends(get_db)):
    check_rate_limit(request)
    
    payload = decode_access_token(refresh_req.refresh_token)
    if not payload or payload.get("token_type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    new_access_token = create_access_token(subject=user.email, role=user.role)
    new_refresh_token = create_refresh_token(subject=user.email, role=user.role)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register", response_model=UserResponse)
async def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    check_rate_limit(request)

    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email address already exists."
        )

    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role.lower(),
        department=user_in.department
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/demo-switch/{role}", response_model=Token)
async def quick_demo_switch(role: str, db: Session = Depends(get_db)):
    """Fast switch between demo accounts: admin, doctor, staff."""
    role_email_map = {
        "admin": "admin@niet.ac.in",
        "doctor": "dr.nazim@niet.ac.in",
        "staff": "nurse.priya@niet.ac.in"
    }
    target_email = role_email_map.get(role.lower(), "dr.nazim@niet.ac.in")
    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        user = db.query(User).filter(User.role == role.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"No demo account found for role '{role}'")

    token = create_access_token(
        subject=user.email,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_refresh_token(subject=user.email, role=user.role)
    return {
        "access_token": token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }
