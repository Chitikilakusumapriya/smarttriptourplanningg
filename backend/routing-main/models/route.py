from utils.db import db
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from sqlalchemy.types import JSON

class Route(db.Model):
    __tablename__ = "routes"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trip_id = db.Column(UUID(as_uuid=True), db.ForeignKey("trips.id"), nullable=False)
    geometry = db.Column(JSON, nullable=False)   # GeoJSON LineString
    distance_km = db.Column(db.Float)
    duration_min = db.Column(db.Float)
    score = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
