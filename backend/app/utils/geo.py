import math


def haversine_distance_km(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """Return distance in km between two points (WGS84)."""
    R = 6371  # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def parse_lat_lon(lat_str: str | None, lon_str: str | None) -> tuple[float | None, float | None]:
    """Parse latitude/longitude strings to floats. Returns (None, None) if invalid."""
    if lat_str is None or lon_str is None:
        return None, None
    try:
        lat = float(lat_str)
        lon = float(lon_str)
        if -90 <= lat <= 90 and -180 <= lon <= 180:
            return lat, lon
    except (ValueError, TypeError):
        pass
    return None, None
