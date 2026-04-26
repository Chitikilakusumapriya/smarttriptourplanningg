import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql://postgres:2745@localhost:5432/tripdb")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
