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
    persons = db.Column(db.Integer, default=1)
    type = db.Column(db.String(50), nullable=True)
    price = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(50), default="CREATED")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
