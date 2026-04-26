from flask import Blueprint, request, jsonify
from utils.db import db
from models.confirmation import Confirmation
from uuid import UUID

conf_bp = Blueprint("conf_bp", __name__)

# Create confirmation (POST)
@conf_bp.route("/api/confirmations", methods=["POST"])
def create_confirmation():
    data = request.get_json() or {}
    pickup = data.get("pickup")
    destination = data.get("destination")
    stops = data.get("stops", [])
    persons = data.get("persons", 1)
    trip_price = data.get("trip_price", 0.0)
    req_type = data.get("type")  # e.g. SUV, XUV, Mini Bus

    if not pickup or not destination:
        return jsonify({"error": "pickup and destination are required"}), 400

    confirmation = Confirmation(
        pickup=pickup,
        destination=destination,
        stops=stops,
        persons=persons,
        trip_price=trip_price,
        type=req_type
    )
    db.session.add(confirmation)
    db.session.commit()

    return jsonify({"confirmation_id": str(confirmation.id)}), 201


# Get all confirmation IDs (GET)
@conf_bp.route("/api/confirmations", methods=["GET"])
def list_confirmations():
    items = Confirmation.query.with_entities(Confirmation.id).all()
    ids = [str(i.id) for i in items]
    return jsonify({"confirmation_ids": ids}), 200


# Get confirmation details by id (GET)
@conf_bp.route("/api/confirmations/<confirmation_id>", methods=["GET"])
def get_confirmation(confirmation_id):
    try:
        uid = UUID(confirmation_id)
    except Exception:
        return jsonify({"error": "invalid confirmation id"}), 400

    c = Confirmation.query.get(uid)
    if not c:
        return jsonify({"error": "confirmation not found"}), 404

    return jsonify({
        "confirmation_id": str(c.id),
        "pickup": c.pickup,
        "destination": c.destination,
        "stops": c.stops,
        "persons": c.persons,
        "trip_price": c.trip_price,
        "type": c.type,
        "created_at": c.created_at.isoformat()
    }), 200


# Delete confirmation by id (DELETE)
@conf_bp.route("/api/confirmations/<confirmation_id>", methods=["DELETE"])
def delete_confirmation(confirmation_id):
    try:
        uid = UUID(confirmation_id)
    except Exception:
        return jsonify({"error": "invalid confirmation id"}), 400

    c = Confirmation.query.get(uid)
    if not c:
        return jsonify({"error": "confirmation not found"}), 404

    # optionally cascade delete driver assignments associated
    from models.assignment import DriverAssignment
    DriverAssignment.query.filter_by(confirmation_id=uid).delete()

    db.session.delete(c)
    db.session.commit()
    return jsonify({"message": "confirmation deleted"}), 200
