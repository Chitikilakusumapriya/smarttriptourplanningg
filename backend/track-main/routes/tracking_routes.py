from flask import Blueprint, request, jsonify
from utils.db import db
from models.location import DriverLocation
from datetime import datetime
from flask_socketio import SocketIO, emit

# Note: socketio instance will be attached in app and imported here if needed.
tracking_bp = Blueprint("tracking_bp", __name__)

# POST /api/location - update DB and emit to connected clients
@tracking_bp.route("/api/location", methods=["POST"])
def update_location():
    data = request.get_json() or {}
    driver_id = data.get("driver_id")
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not all([driver_id, latitude, longitude]):
        return jsonify({"error":"driver_id, latitude and longitude required"}), 400

    # upsert location
    loc = DriverLocation.query.filter_by(driver_id=driver_id).first()
    if loc:
        loc.latitude = latitude
        loc.longitude = longitude
        loc.updated_at = datetime.utcnow()
    else:
        loc = DriverLocation(driver_id=driver_id, latitude=latitude, longitude=longitude)
        db.session.add(loc)
    db.session.commit()

    # Emit realtime update via Socket.IO
    # Import socketio here to avoid circular imports. The app will set socketio on current_app.
    from flask import current_app
    socketio = current_app.extensions.get('socketio')
    payload = {
        "driver_id": driver_id,
        "latitude": latitude,
        "longitude": longitude,
        "updated_at": loc.updated_at.isoformat()
    }
    # emit to room named with driver_id
    if socketio:
        socketio.emit("location_update", payload, room=driver_id, namespace="/track")
    return jsonify({"message":"Location updated", "driver_id": driver_id}), 200

@tracking_bp.route("/api/location/<driver_id>", methods=["GET"])
def get_location(driver_id):
    loc = DriverLocation.query.filter_by(driver_id=driver_id).first()
    if not loc:
        return jsonify({"error":"Driver not found"}), 404
    return jsonify({
        "driver_id": loc.driver_id,
        "latitude": loc.latitude,
        "longitude": loc.longitude,
        "updated_at": loc.updated_at.isoformat()
    }), 200
