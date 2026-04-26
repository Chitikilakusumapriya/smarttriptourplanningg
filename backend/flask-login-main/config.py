import os

class Config:
    SECRET_KEY = "supersecretkey123"
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:2745@localhost:5432/flask_auth"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "jwtsecretkey123"
