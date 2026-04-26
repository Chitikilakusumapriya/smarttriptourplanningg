import os
class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "postgresql://postgres:2745@localhost:5432/driver_routing")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    OSRM_URL = os.getenv("OSRM_URL", "https://router.project-osrm.org")  # use self-hosted in prod
    ALTERNATIVES = 3
