"""
Public user account endpoints (registration, login, profile)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from app.core.deps import get_db
from app.core.config import settings
from app.crud.crud_user_account import crud_user_account
from app.schemas.user_account import (
    UserAccountCreate,
    UserAccountResponse,
    UserAccountUpdate,
    UserAccountToken,
)
from jose import JWTError, jwt

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/login", auto_error=False)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=30)  # 30 days for user accounts
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> UserAccountResponse:
    """Get current authenticated user."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = crud_user_account.get(db, id=user_id)
    if user is None:
        raise credentials_exception
    
    return UserAccountResponse.from_orm(user)


@router.post("/register", response_model=UserAccountResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserAccountCreate, db: Session = Depends(get_db)):
    """Register a new user account."""
    # Check if email already exists
    existing = crud_user_account.get_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    user = crud_user_account.create(db, obj_in=user_in)
    return UserAccountResponse.from_orm(user)


@router.post("/login", response_model=UserAccountToken)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Login and get access token."""
    user = crud_user_account.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    db.commit()
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserAccountResponse.from_orm(user),
    }


@router.get("/me", response_model=UserAccountResponse)
def get_current_user_info(current_user: UserAccountResponse = Depends(get_current_user)):
    """Get current user information."""
    return current_user


@router.put("/me", response_model=UserAccountResponse)
def update_current_user(
    user_update: UserAccountUpdate,
    current_user: UserAccountResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user information."""
    user = crud_user_account.get(db, id=current_user.id)
    updated_user = crud_user_account.update(db, db_obj=user, obj_in=user_update)
    return UserAccountResponse.from_orm(updated_user)

