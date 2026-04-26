from flask import Flask
from config import Config
from flask_cors import CORS
from utils.db import db
from routes.vehicle_routes import vehicle_bp

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

with app.app_context():
    db.create_all()

CORS(app, origins=["http://localhost:5173"])

app.register_blueprint(vehicle_bp)

@app.route("/")
def home():
    return {"message": "Vehicle Service Running 🚗"}

if __name__ == "__main__":
    app.run(debug=True, port=5002)  # Run on a separate microservice port
