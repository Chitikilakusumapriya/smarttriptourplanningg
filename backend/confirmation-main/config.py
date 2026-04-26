import os

class Config:
    # Use DATABASE_URL env var if set, otherwise local default
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:2745@localhost:5432/confirmations_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
