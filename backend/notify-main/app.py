from flask import Flask
from flask_mail import Mail
from utils.db import db
from flask_cors import CORS
from config import Config
from routes import routes, mail

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
mail.init_app(app)

app.register_blueprint(routes)

CORS(app, origins=["http://localhost:5173"])

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5005)
