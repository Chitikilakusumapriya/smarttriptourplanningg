from utils.db import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.types import JSON

class Trip(db.Model):
    __tablename__ = "trips"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pickup = db.Column(db.String(255), nullable=False)
    destination = db.Column(db.String(255), nullable=False)
    stops = db.Column(JSON, default=[])
    distance_km = db.Column(db.Float, nullable=False)
    eta_minutes = db.Column(db.Float, nullable=False)
    persons = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
