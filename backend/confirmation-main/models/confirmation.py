from utils.db import db
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import JSON

class Confirmation(db.Model):
    __tablename__ = "confirmations"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pickup = db.Column(db.String(255), nullable=False)
    destination = db.Column(db.String(255), nullable=False)
    stops = db.Column(JSON, default=[])
    persons = db.Column(db.Integer, nullable=False, default=1)
    trip_price = db.Column(db.Float, nullable=False, default=0.0)
    type = db.Column(db.String(50), nullable=True)  # vehicle type requested (e.g. SUV)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
