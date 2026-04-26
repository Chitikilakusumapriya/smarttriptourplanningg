from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import time

def geocode_address(address):
    """
    Converts an address string into (latitude, longitude).
    Returns None if the address cannot be found.
    """
    geolocator = Nominatim(user_agent="trip_service_backend_123")

    try:
        # Sleep to avoid hitting OpenStreetMap rate limit
        time.sleep(1)

        location = geolocator.geocode(address, exactly_one=True, timeout=10)

        if location:
            print(f"[INFO] Geocoded: {address} -> ({location.latitude}, {location.longitude})")
            return (location.latitude, location.longitude)
        else:
            print(f"[WARN] Address not found: {address}")
            return None

    except (GeocoderTimedOut, GeocoderServiceError) as e:
        print(f"[ERROR] Geocoding failed for {address}: {e}")
        return None
