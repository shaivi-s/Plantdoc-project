"""Database tables, defined as Python classes (SQLAlchemy models)."""
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Table, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


# Link table for the many-to-many between diseases and medicines
disease_medicine = Table(
    "disease_medicine", Base.metadata,
    Column("disease_id", ForeignKey("diseases.id"), primary_key=True),
    Column("medicine_id", ForeignKey("medicines.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    profile_image = Column(Text, nullable=True)


class Medicine(Base):
    __tablename__ = "medicines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    dosage = Column(String, default="")
    application = Column(String, default="")
    frequency = Column(String, default="")
    precautions = Column(String, default="")
    name_ne = Column(String, default="")
    dosage_ne = Column(String, default="")
    application_ne = Column(String, default="")
    frequency_ne = Column(String, default="")
    precautions_ne = Column(String, default="")


class Disease(Base):
    __tablename__ = "diseases"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    plant_type = Column(String, default="")     # Maize / Wheat
    description = Column(String, default="")
    symptoms = Column(String, default="")
    prevention = Column(String, default="")
    severity = Column(String, default="moderate")
    medicines = relationship("Medicine", secondary=disease_medicine, backref="diseases")
    name_ne = Column(String, default="")
    description_ne = Column(String, default="")
    symptoms_ne = Column(String, default="")
    prevention_ne = Column(String, default="")
    medicines = relationship("Medicine", secondary=disease_medicine, backref="diseases")

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    predicted_class = Column(String, nullable=False)
    confidence = Column(Float, default=0.0)
    is_healthy = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())