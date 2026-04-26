from flask import Flask
from config import Config
from flask_cors import CORS
from utils.db import db
from routes.trip_routes import bp as trip_bp
from routes.map_routes import map_bp  # ✅ Import your new map routes

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow CORS only for your frontend origin (Vite on port 5173)
    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

    db.init_app(app)

    # Register all blueprints
    app.register_blueprint(trip_bp)
    app.register_blueprint(map_bp)  # ✅ Register map routes

    return app


app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5005, debug=True)
