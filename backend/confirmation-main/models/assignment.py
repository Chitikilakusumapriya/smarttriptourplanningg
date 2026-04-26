from utils.db import db
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID

class DriverAssignment(db.Model):
    __tablename__ = "driver_assignments"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # internal id
    confirmation_id = db.Column(UUID(as_uuid=True), db.ForeignKey('confirmations.id'), nullable=False)
    driver_id = db.Column(UUID(as_uuid=True), nullable=False, default=uuid.uuid4)  # generated unique driver id for this assignment
    status = db.Column(db.String(50), nullable=False, default="PENDING_DRIVER")  # PENDING_DRIVER / CONFIRMED
    vehicle_no = db.Column(db.String(50), nullable=True)
    vehicle_type = db.Column(db.String(50), nullable=True)
    driver_name = db.Column(db.String(150), nullable=True)
    driver_phone = db.Column(db.String(50), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
