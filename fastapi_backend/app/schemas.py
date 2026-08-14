"""Pydantic schemas - define the shape of request and response data."""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    location: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MedicineOut(BaseModel):
    id: int
    name: str
    dosage: str
    application: str
    frequency: str
    precautions: str

    class Config:
        from_attributes = True


class DiseaseOut(BaseModel):
    id: int
    name: str
    plant_type: str
    description: str
    symptoms: str
    prevention: str
    severity: str
    medicines: List[MedicineOut] = []

    class Config:
        from_attributes = True


class EmailRequest(BaseModel):
    email: str


class ResetVerify(BaseModel):
    email: str
    code: str
    new_password: str


class PhotoUpload(BaseModel):
    image: str


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class PasswordConfirm(BaseModel):
    password: str


class ScanCreate(BaseModel):
    predicted_class: str
    confidence: float
    is_healthy: bool


class ScanOut(BaseModel):
    id: int
    predicted_class: str
    confidence: float
    is_healthy: bool
    created_at: datetime

    class Config:
        from_attributes = True