import requests

def compute_route(coords):
    # coords = [(lat, lon), ...]
    if len(coords) < 2: return None
    coord_str = ";".join([f"{lon},{lat}" for lat, lon in coords])
    url = f"https://router.project-osrm.org/route/v1/driving/{coord_str}?overview=full&geometries=geojson"
    res = requests.get(url)
    if res.status_code != 200: return None
    data = res.json()
    if not data.get("routes"): return None
    route = data["routes"][0]
    distance_km = route["distance"] / 1000
    eta_minutes = route["duration"] / 60
    geometry = route["geometry"]
    return distance_km, eta_minutes, geometry
