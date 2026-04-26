from flask import Flask
from flask_cors import CORS  # <-- Added for frontend React
from config import Config
from utils.db import db
from routes.auth_routes import auth_bp, jwt, bcrypt

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for React frontend
CORS(app, origins=["http://localhost:5173"])  # <-- allow only React frontend
# If you want to allow all origins: CORS(app)

# Initialize extensions
db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp)

# Health check or home route
@app.route('/')
def home():
    return {"message": "Flask Auth Service Running 🚀"}

# Run the app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables if not exist
    app.run(debug=True, host='0.0.0.0', port=5000)
