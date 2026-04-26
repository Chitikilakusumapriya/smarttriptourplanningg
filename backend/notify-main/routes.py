from flask import Blueprint, request, jsonify, current_app
from flask_mail import Mail, Message
from utils.db import db
from models import Trip
import uuid

routes = Blueprint("routes", __name__)
mail = Mail()

# ------------------ CREATE TRIP ------------------
@routes.route("/api/trips", methods=["POST"])
def create_trip():
    data = request.get_json()
    required_fields = ["pickup", "destination", "stops", "persons", "trip_price", "trip_type", "user_email", "family_email"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing fields"}), 400

    confirmation_id = str(uuid.uuid4())

    trip = Trip(
        id=confirmation_id,
        pickup=data["pickup"],
        destination=data["destination"],
        stops=data["stops"],
        persons=data["persons"],
        trip_price=data["trip_price"],
        trip_type=data["trip_type"],
        user_email=data["user_email"],
        family_email=data["family_email"]
    )

    db.session.add(trip)
    db.session.commit()

    # Send emails
    try:
        with current_app.app_context():
            msg_user = Message(
                subject="Trip Confirmation",
                sender=current_app.config["MAIL_USERNAME"],
                recipients=[data["user_email"]],
                body=f"Hello! Your trip from {data['pickup']} to {data['destination']} is confirmed.\n\nConfirmation ID: {confirmation_id}"
            )
            msg_family = Message(
                subject="Family Trip Confirmation",
                sender=current_app.config["MAIL_USERNAME"],
                recipients=[data["family_email"]],
                body=f"Dear Family Member,\nThe trip for your loved one is confirmed.\nTrip ID: {confirmation_id}\nPickup: {data['pickup']}\nDestination: {data['destination']}"
            )
            mail.send(msg_user)
            mail.send(msg_family)
    except Exception as e:
        return jsonify({"error": f"Trip created but failed to send emails: {str(e)}"}), 500

    return jsonify({
        "confirmation_id": confirmation_id,
        "message": "Trip created and confirmation emails sent."
    }), 201


# ------------------ ADMIN DASHBOARD ------------------
@routes.route("/api/trips", methods=["GET"])
def get_all_trips():
    """Fetch all confirmed trips for admin dashboard"""
    trips = Trip.query.all()
    result = []
    for t in trips:
        result.append({
            "confirmation_id": str(t.id),
            "pickup": t.pickup,
            "destination": t.destination,
            "stops": t.stops,
            "persons": t.persons,
            "trip_price": t.trip_price,
            "trip_type": t.trip_type,
            "user_email": t.user_email,
            "family_email": t.family_email,
            "created_at": t.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
    return jsonify(result), 200
