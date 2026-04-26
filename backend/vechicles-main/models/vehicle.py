from utils.db import db
import uuid

class Vehicle(db.Model):
    __tablename__ = "vehicles"

    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = db.Column(db.String(50), nullable=False)   # e.g. SUV, XUV, Mini Bus
    quantity = db.Column(db.Integer, nullable=False, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "quantity": self.quantity
        }
