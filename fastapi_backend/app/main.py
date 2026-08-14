"""
PlantDoc FastAPI Backend - main application.
Run:  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Docs: http://localhost:8000/docs
"""
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import re

from . import models, schemas, auth, predictor, email_service
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PlantDoc API", version="1.0.0")

reset_codes = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "PlantDoc API is running"}


# ---------------- AUTH ----------------
@app.post("/api/auth/register", response_model=schemas.TokenResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        location=user.location,
        hashed_password=auth.hash_password(user.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = auth.create_access_token(new_user.id)
    return {"access_token": token, "token_type": "bearer", "user": new_user}


@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = auth.create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer", "user": user}


@app.get("/api/auth/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@app.post("/api/auth/upload-photo")
def upload_photo(
    data: schemas.PhotoUpload,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    current_user.profile_image = data.image
    db.commit()
    return {"message": "Photo updated"}


@app.put("/api/auth/update-profile", response_model=schemas.UserOut)
def update_profile(
    data: schemas.ProfileUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.phone is not None:
        current_user.phone = data.phone
    if data.location is not None:
        current_user.location = data.location
    db.commit()
    db.refresh(current_user)
    return current_user


@app.post("/api/auth/change-password")
def change_password(
    data: schemas.PasswordChange,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    if not auth.verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    error = is_strong_password(data.new_password)
    if error:
        raise HTTPException(status_code=400, detail=error)

    current_user.hashed_password = auth.hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


@app.post("/api/auth/delete-account")
def delete_account(
    data: schemas.PasswordConfirm,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    if not auth.verify_password(data.password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    db.query(models.Prediction).filter(
        models.Prediction.user_id == current_user.id
    ).delete()
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted"}


# ---------------- PASSWORD RESET ----------------
def is_strong_password(pw: str):
    if len(pw) < 8:
        return "Password must be at least 8 characters."
    if not re.search(r"[A-Za-z]", pw):
        return "Password must contain a letter."
    if not re.search(r"[0-9]", pw):
        return "Password must contain a number."
    if not re.search(r"[^A-Za-z0-9]", pw):
        return "Password must contain a symbol (e.g. @, #, !)."
    return None


@app.post("/api/auth/request-reset")
def request_reset(data: schemas.EmailRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")

    code = email_service.generate_code()
    reset_codes[data.email] = {
        "code": code,
        "expires": datetime.now() + timedelta(minutes=10),
    }
    try:
        email_service.send_reset_code(data.email, code)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not send email. Try again.")

    return {"message": "A reset code has been sent to your email."}


@app.post("/api/auth/verify-reset")
def verify_reset(data: schemas.ResetVerify, db: Session = Depends(get_db)):
    entry = reset_codes.get(data.email)
    if not entry:
        raise HTTPException(status_code=400, detail="No reset request found. Start again.")
    if datetime.now() > entry["expires"]:
        del reset_codes[data.email]
        raise HTTPException(status_code=400, detail="Code expired. Request a new one.")
    if data.code != entry["code"]:
        raise HTTPException(status_code=400, detail="Incorrect code.")

    error = is_strong_password(data.new_password)
    if error:
        raise HTTPException(status_code=400, detail=error)

    user = db.query(models.User).filter(models.User.email == data.email).first()
    user.hashed_password = auth.hash_password(data.new_password)
    db.commit()
    del reset_codes[data.email]

    return {"message": "Password updated successfully"}


# ---------------- SCAN HISTORY ----------------
@app.post("/api/scans")
def save_scan(
    data: schemas.ScanCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    scan = models.Prediction(
        user_id=current_user.id,
        predicted_class=data.predicted_class,
        confidence=data.confidence,
        is_healthy=data.is_healthy,
    )
    db.add(scan)
    db.commit()
    return {"message": "Scan saved"}


@app.get("/api/scans", response_model=list[schemas.ScanOut])
def list_scans(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Prediction)
        .filter(models.Prediction.user_id == current_user.id)
        .order_by(models.Prediction.created_at.desc())
        .all()
    )


# ---------------- DISEASES / MEDICINES ----------------
@app.get("/api/diseases", response_model=list[schemas.DiseaseOut])
def list_diseases(db: Session = Depends(get_db)):
    return db.query(models.Disease).all()


@app.get("/api/diseases/{disease_id}", response_model=schemas.DiseaseOut)
def get_disease(disease_id: int, db: Session = Depends(get_db)):
    disease = db.query(models.Disease).filter(models.Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    return disease


@app.get("/api/medicines", response_model=list[schemas.MedicineOut])
def list_medicines(db: Session = Depends(get_db)):
    return db.query(models.Medicine).all()


# ---------------- PREDICTION ----------------
@app.post("/api/predict")
async def predict(file: UploadFile = File(...), db: Session = Depends(get_db)):
    image_bytes = await file.read()
    result = predictor.predict_image(image_bytes)

    if not result["is_valid_leaf"]:
     return {
        "is_valid_leaf": False,
        "message": result["reject_message"],
        "message_ne": result["reject_message_ne"],
        "confidence": result["confidence"],
    }

    disease = db.query(models.Disease).filter(
        models.Disease.name == result["disease_name"]
    ).first()

    response = {
        "is_valid_leaf": True,
        "disease": result["disease_name"],
        "disease_ne": disease.name_ne if disease else None,
        "confidence": result["confidence"],
        "found_in_database": disease is not None,
    }

    if disease:
        response.update({
            "plant_type": disease.plant_type,
            "description": disease.description,
            "description_ne": disease.description_ne,
            "symptoms": disease.symptoms,
            "symptoms_ne": disease.symptoms_ne,
            "prevention": disease.prevention,
            "prevention_ne": disease.prevention_ne,
            "severity": disease.severity,
            "medicines": [
                {
                    "name": m.name,
                    "name_ne": m.name_ne,
                    "dosage": m.dosage,
                    "dosage_ne": m.dosage_ne,
                    "application": m.application,
                    "application_ne": m.application_ne,
                    "frequency": m.frequency,
                    "frequency_ne": m.frequency_ne,
                    "precautions": m.precautions,
                    "precautions_ne": m.precautions_ne,
                }
                for m in disease.medicines
            ],
        })

    return response