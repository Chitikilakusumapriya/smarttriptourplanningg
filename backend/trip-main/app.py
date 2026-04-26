from flask import Flask
from config import Config
from flask_cors import CORS
from utils.db import db
from routes.trip_routes import trip_bp

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, origins=["http://localhost:5173"])

# Initialize DB
db.init_app(app)

with app.app_context():
    db.create_all()

# Register routes
app.register_blueprint(trip_bp)

@app.route("/")
def home():
    return {"message": "Trip Service Running 🚀"}

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
