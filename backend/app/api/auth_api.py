from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import LoginRequest, LoginResponse, SignupRequest, SignupResponse
from app.services.auth_service import (
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    login_user,
    signup_user,
)

router = APIRouter(tags=["auth"])


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> SignupResponse:
    try:
        access_token = await signup_user(
            db=db,
            name=payload.name,
            email=payload.email,
            password=payload.password,
        )
        return SignupResponse(message="Signup successful", access_token=access_token)
    except EmailAlreadyExistsError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while creating user",
        ) from error
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while creating user",
        ) from error


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    try:
        access_token = await login_user(
            db=db,
            email=payload.email,
            password=payload.password,
        )
        return LoginResponse(message="Login successful", access_token=access_token)
    except InvalidCredentialsError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while logging in",
        ) from error
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error while logging in",
        ) from error
