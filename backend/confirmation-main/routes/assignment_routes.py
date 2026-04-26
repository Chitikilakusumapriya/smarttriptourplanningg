from flask import Blueprint, request, jsonify
from utils.db import db
from models.assignment import DriverAssignment
from models.confirmation import Confirmation
from uuid import UUID
import uuid

assign_bp = Blueprint("assign_bp", __name__)

# Admin assigns a driver id to a confirmation (generates driver_id) (POST)
# Request: { "confirmation_id": "<id>" }
# Response: { "confirmation_id": "...", "driver_id": "...", "message": "trip is confirmed by the admin waiting for the driver confirmation" }
@assign_bp.route("/api/assignments", methods=["POST"])
def create_assignment():
    data = request.get_json() or {}
    confirmation_id = data.get("confirmation_id")
    if not confirmation_id:
        return jsonify({"error": "confirmation_id required"}), 400

    try:
        uid = UUID(confirmation_id)
    except Exception:
        return jsonify({"error": "invalid confirmation id"}), 400

    # Ensure confirmation exists
    c = Confirmation.query.get(uid)
    if not c:
        return jsonify({"error": "confirmation not found"}), 404

    # create assignment with generated driver_id
    assignment = DriverAssignment(
        confirmation_id=uid,
        driver_id=uuid.uuid4(),
        status="PENDING_DRIVER"
    )
    db.session.add(assignment)
    db.session.commit()

    return jsonify({
        "confirmation_id": str(assignment.confirmation_id),
        "driver_id": str(assignment.driver_id),
        "message": "the trip is confirmed by the admin waiting for the driver confirmation"
    }), 201


# GET assignment by driver id -> returns confirmation_id, driver_id, message
@assign_bp.route("/api/assignments/driver/<driver_id>", methods=["GET"])
def get_assignment_by_driver(driver_id):
    from uuid import UUID
    try:
        did = UUID(driver_id)
    except Exception:
        return jsonify({"error": "invalid driver id"}), 400

    a = DriverAssignment.query.filter_by(driver_id=did).first()
    if not a:
        return jsonify({"error": "assignment not found"}), 404

    # If the driver has not yet confirmed (no vehicle info)
    if not a.vehicle_no or not a.driver_name or not a.driver_phone:
        return jsonify({
            "confirmation_id": str(a.confirmation_id),
            "driver_id": str(a.driver_id),
            "message": "the trip is confirmed by the admin waiting for the driver confirmation"
        }), 200

    # If driver already confirmed the trip
    return jsonify({
        "vehicle_no": a.vehicle_no,
        "type": a.vehicle_type,
        "driver_name": a.driver_name,
        "ph_no": a.driver_phone
    }), 200



# GET assignment by confirmation_id -> returns confirmation_id, driver_id, message
@assign_bp.route("/api/assignments/confirmation/<confirmation_id>", methods=["GET"])
def get_assignment_by_confirmation(confirmation_id):
    from uuid import UUID
    try:
        cid = UUID(confirmation_id)
    except Exception:
        return jsonify({"error": "invalid confirmation id"}), 400

    a = DriverAssignment.query.filter_by(confirmation_id=cid).first()
    if not a:
        return jsonify({"error": "assignment not found"}), 404

    message = "the trip is confirmed by the admin waiting for the driver confirmation" if a.status == "PENDING_DRIVER" else "driver confirmed the trip"

    return jsonify({
        "confirmation_id": str(a.confirmation_id),
        "driver_id": str(a.driver_id),
        "message": message
    }), 200



# Driver confirms assignment with driver & vehicle details (POST)
# Request body:
# {
#   "confirmation_id": "...",
#   "driver_id": "...",
#   "vehicle_no": "AB12CD3456",
#   "type": "SUV",
#   "driver_name": "Rahul",
#   "ph_no": "9876543210"
# }
# Response:
# {
#   "driver_id": "...",
#   "vehicle_no": "AB12CD3456",
#   "type": "SUV",
#   "driver_name": "Rahul",
#   "ph_no": "9876543210"
# }
@assign_bp.route("/api/assignments/confirm", methods=["POST"])
def driver_confirm():
    data = request.get_json() or {}
    confirmation_id = data.get("confirmation_id")
    driver_id = data.get("driver_id")
    vehicle_no = data.get("vehicle_no")
    vtype = data.get("type")
    driver_name = data.get("driver_name")
    ph_no = data.get("ph_no")

    if not all([confirmation_id, driver_id, vehicle_no, vtype, driver_name, ph_no]):
        return jsonify({"error": "all fields are required"}), 400

    try:
        cid = UUID(confirmation_id)
        did = UUID(driver_id)
    except Exception:
        return jsonify({"error": "invalid id format"}), 400

    assignment = DriverAssignment.query.filter_by(confirmation_id=cid, driver_id=did).first()
    if not assignment:
        return jsonify({"error": "assignment not found"}), 404

    # update details
    assignment.vehicle_no = vehicle_no
    assignment.vehicle_type = vtype
    assignment.driver_name = driver_name
    assignment.driver_phone = ph_no
    assignment.status = "CONFIRMED"

    db.session.commit()

    return jsonify({
        "driver_id": str(assignment.driver_id),
        "vehicle_no": assignment.vehicle_no,
        "type": assignment.vehicle_type,
        "driver_name": assignment.driver_name,
        "ph_no": assignment.driver_phone
    }), 200
