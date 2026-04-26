# routes/map_routes.py
import os
import requests
from flask import Blueprint, send_file

map_bp = Blueprint("map_bp", __name__, url_prefix="/api/map")

TILE_DIR = "cached_tiles"
os.makedirs(TILE_DIR, exist_ok=True)

@map_bp.route("/tiles/<int:z>/<int:x>/<int:y>.png")
def get_tile(z, x, y):
    path = os.path.join(TILE_DIR, f"{z}_{x}_{y}.png")
    if os.path.exists(path):
        return send_file(path, mimetype="image/png")

    url = f"https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    r = requests.get(url)
    if r.status_code == 200:
        with open(path, "wb") as f:
            f.write(r.content)
        return send_file(path, mimetype="image/png")
    else:
        return {"error": "Tile not found"}, 404
