from utils.db import db
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID

class Trip(db.Model):
    __tablename__ = "trips"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pickup = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    stops = db.Column(db.String(200), nullable=True)
    persons = db.Column(db.Integer, nullable=False)
    trip_price = db.Column(db.Float, nullable=False)
    trip_type = db.Column(db.String(50), nullable=False)
    user_email = db.Column(db.String(120), nullable=False)
    family_email = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
