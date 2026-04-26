from flask import Blueprint, request, jsonify
from utils.db import db
from models.vehicle import Vehicle

vehicle_bp = Blueprint("vehicle_bp", __name__)

# Add new vehicle
@vehicle_bp.route("/api/vehicles", methods=["POST"])
def add_vehicle():
    data = request.get_json()
    vehicle_type = data.get("type")
    quantity = data.get("quantity", 0)

    if not vehicle_type:
        return jsonify({"error": "Vehicle type required"}), 400

    new_vehicle = Vehicle(type=vehicle_type, quantity=quantity)
    db.session.add(new_vehicle)
    db.session.commit()

    return jsonify({"message": "Vehicle added successfully", "vehicle": new_vehicle.to_dict()}), 201


# Get all vehicles
@vehicle_bp.route("/api/vehicles", methods=["GET"])
def get_vehicles():
    vehicles = Vehicle.query.all()
    return jsonify([v.to_dict() for v in vehicles]), 200


# Update vehicle quantity
@vehicle_bp.route("/api/vehicles/<vehicle_id>", methods=["PUT"])
def update_vehicle(vehicle_id):
    data = request.get_json()
    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404

    new_quantity = data.get("quantity")
    if new_quantity is None:
        return jsonify({"error": "Quantity is required"}), 400

    vehicle.quantity = new_quantity
    db.session.commit()

    return jsonify({"message": "Vehicle quantity updated", "vehicle": vehicle.to_dict()}), 200
