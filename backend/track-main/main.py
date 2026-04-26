from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from config import Config
from utils.db import db
from routes.tracking_routes import tracking_bp
from sockets import TrackNamespace

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)  # allow your frontend
    db.init_app(app)

    # register blueprints
    app.register_blueprint(tracking_bp)

    return app

app = create_app()

# initialize socketio with eventlet
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# attach socketio to app.extensions so routes can access it
app.extensions['socketio'] = socketio

# register namespace
socketio.on_namespace(TrackNamespace("/track"))

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    # run with eventlet
    socketio.run(app, host="0.0.0.0", port=5004)
