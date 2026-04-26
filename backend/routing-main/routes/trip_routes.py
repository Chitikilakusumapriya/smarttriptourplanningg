from flask import Blueprint, request, jsonify, current_app
from utils.db import db
from models.trip import Trip
from models.route import Route
import requests, uuid, time, math

bp = Blueprint("driver_routing", __name__)

def osrm_route(coords, alternatives=3):
    """
    coords: list of (lon,lat) pairs in order
    returns OSRM response with alternatives if available
    """
    base = current_app.config["OSRM_URL"]
    coord_str = ";".join([f"{c[0]},{c[1]}" for c in coords])
    url = f"{base}/route/v1/driving/{coord_str}?overview=full&geometries=geojson&alternatives={alternatives}"
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    return r.json()

def mock_traffic_penalty(segment_geometry):
    """
    Replace this with real traffic ingestion. For demo we return 0..1 penalty.
    """
    # naive random or deterministic penalty - here keep zero
    return 0.0

def score_route(osrm_route_obj):
    # compute cost = duration * (1 + avg_penalty)
    route = osrm_route_obj
    duration = route['duration']  # seconds
    # derive penalty by sampling segments (mocked)
    penalty = 0.0
    # sample polyline coordinates (approx)
    coords = route['geometry']['coordinates']
    if not coords:
        penalty = 0.0
    else:
        # average penalty across segments
        penalties = []
        for seg in coords[::max(1, len(coords)//10)]:
            penalties.append(mock_traffic_penalty(seg))
        penalty = sum(penalties)/len(penalties) if penalties else 0.0
    cost = duration * (1 + penalty)
    return cost, duration, route['distance']

@bp.route("/api/trips", methods=["POST"])
def create_trip():
    data = request.json or {}
    pickup = data.get("pickup")
    destination = data.get("destination")
    stops = data.get("stops", [])
    persons = data.get("persons", 1)
    rtype = data.get("type")
    price = data.get("price", 0.0)
    if not pickup or not destination:
        return jsonify({"error":"pickup & destination required"}), 400

    # You need to geocode addresses to coordinates. Here we expect coordinates passed:
    # pickup_coord: [lon,lat]
    pickup_coord = data.get("pickup_coord")
    destination_coord = data.get("destination_coord")
    stops_coords = data.get("stops_coords", [])  # list of [lon,lat]

    if not pickup_coord or not destination_coord:
        return jsonify({"error":"please provide pickup_coord and destination_coord (lon,lat)"}), 400

    trip = Trip(pickup=pickup, destination=destination, stops=stops, persons=persons, type=rtype, price=price)
    db.session.add(trip)
    db.session.commit()

    # Build full coordinate list for routing
    coords = [pickup_coord] + stops_coords + [destination_coord]
    osrm_resp = osrm_route(coords, alternatives=current_app.config.get("ALTERNATIVES", 3))
    if 'routes' not in osrm_resp:
        return jsonify({"error":"no route found"}), 500

    # Score alternatives and persist best as active
    best = None
    best_score = float('inf')
    for route_obj in osrm_resp['routes']:
        cost, duration, distance = score_route(route_obj)
        route = Route(trip_id=trip.id, geometry=route_obj['geometry'], distance_km=distance/1000.0, duration_min=duration/60.0, score=cost, is_active=False)
        db.session.add(route)
        db.session.flush()
        if cost < best_score:
            best_score = cost
            best = route
    if best:
        best.is_active = True
    db.session.commit()

    return jsonify({"trip_id": str(trip.id), "best_route_id": str(best.id)}), 201

@bp.route("/api/trips/<trip_id>/route", methods=["GET"])
def get_route(trip_id):
    r = Route.query.filter_by(trip_id=trip_id, is_active=True).first()
    if not r:
        return jsonify({"error":"route not found"}), 404
    return jsonify({
        "route_id": str(r.id),
        "geometry": r.geometry,
        "distance_km": r.distance_km,
        "duration_min": r.duration_min,
        "score": r.score
    }), 200

@bp.route("/api/trips/<trip_id>/alternatives", methods=["GET"])
def get_alternatives(trip_id):
    rows = Route.query.filter_by(trip_id=trip_id).order_by(Route.score.asc()).all()
    return jsonify([
        {
            "route_id": str(r.id),
            "distance_km": r.distance_km,
            "duration_min": r.duration_min,
            "score": r.score
        } for r in rows
    ])
