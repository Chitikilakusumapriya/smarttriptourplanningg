from flask import Blueprint, request, jsonify
from utils.db import db
from models.trip import Trip
from utils.geocode import geocode_address
from utils.routing import compute_route

trip_bp = Blueprint("trip_bp", __name__)

PRICE_PER_KM = 10  # currency unit per km per person

@trip_bp.route("/api/trips", methods=["POST"])
def create_trip():
    data = request.json
    pickup = data.get("pickup")
    destination = data.get("destination")
    stops = data.get("stops", [])
    persons = data.get("persons", 1)

    if not pickup or not destination or persons < 1:
        return jsonify({"error": "Invalid input"}), 400

    # Geocode all points
    coords = []
    for addr in [pickup] + stops + [destination]:
        latlon = geocode_address(addr)
        if not latlon:
            return jsonify({"error": f"Address not found: {addr}"}), 400
        coords.append(latlon)

    # Compute route
    route_result = compute_route(coords)
    if not route_result:
        return jsonify({"error": "Route could not be computed"}), 500
    distance_km, eta_minutes, geometry = route_result

    # Save to DB
    trip = Trip(
        pickup=pickup,
        destination=destination,
        stops=stops,
        distance_km=distance_km,
        eta_minutes=eta_minutes,
        persons=persons
    )
    db.session.add(trip)
    db.session.commit()

    return jsonify({
        "trip_id": str(trip.id),
        "pickup": trip.pickup,
        "destination": trip.destination,
        "stops": trip.stops,
        "distance_km": trip.distance_km,
        "eta_minutes": trip.eta_minutes,
        "persons": trip.persons
    }), 201

@trip_bp.route("/api/trips/<trip_id>", methods=["GET"])
def get_trip(trip_id):
    trip = Trip.query.get(trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    price = trip.distance_km * trip.persons * PRICE_PER_KM
    return jsonify({
        "trip_id": str(trip.id),
        "pickup": trip.pickup,
        "destination": trip.destination,
        "stops": trip.stops,
        "distance_km": trip.distance_km,
        "eta_minutes": trip.eta_minutes,
        "persons": trip.persons,
        "price": price
    })
