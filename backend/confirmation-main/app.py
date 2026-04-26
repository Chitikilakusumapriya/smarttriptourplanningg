from flask import Flask
from config import Config
from utils.db import db
from flask_cors import CORS
from routes.confirmation_routes import conf_bp
from routes.assignment_routes import assign_bp

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
with app.app_context():
    db.create_all()

CORS(app, origins=["http://localhost:5173"])
app.register_blueprint(conf_bp)
app.register_blueprint(assign_bp)

@app.route("/")
def home():
    return {"message": "Confirmation Service running"}

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5003)
