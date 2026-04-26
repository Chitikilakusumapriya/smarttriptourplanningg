from utils.db import db
from datetime import datetime
import uuid

class DriverLocation(db.Model):
    __tablename__ = "driver_locations"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    driver_id = db.Column(db.String, nullable=False, unique=True)  # unique per driver
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
