"""
Mumbai Metropolitan Region (MMR) Road Network Graph.
"""
import networkx as nx
from typing import Dict, Any, List, Tuple
from src.data.schemas import GeoLocation


# Complete GPS Registry of Major MMR Nodes
MMR_NODES: Dict[str, Dict[str, Any]] = {
    "thane": {"name": "Thane Teen Hath Naka", "lat": 19.2183, "lng": 72.9781, "type": "city"},
    "borivali": {"name": "Borivali West", "lat": 19.2307, "lng": 72.8567, "type": "suburb"},
    "airport": {"name": "Mumbai Airport (BOM)", "lat": 19.0896, "lng": 72.8656, "type": "airport"},
    "bkc": {"name": "Bandra Kurla Complex", "lat": 19.0607, "lng": 72.8683, "type": "business"},
    "andheri": {"name": "Andheri East / WEH", "lat": 19.1136, "lng": 72.8697, "type": "suburb"},
    "kurla": {"name": "Kurla West (LBS Marg)", "lat": 19.0728, "lng": 72.8797, "type": "suburb", "flood_basin": True},
    "ghatkopar": {"name": "Ghatkopar EEH", "lat": 19.0860, "lng": 72.9080, "type": "suburb"},
    "mulund": {"name": "Mulund Check Naka", "lat": 19.1726, "lng": 72.9565, "type": "suburb"},
    "dadar": {"name": "Dadar TT Circle", "lat": 19.0178, "lng": 72.8478, "type": "transit"},
    "colaba": {"name": "Colaba / Nariman Pt", "lat": 18.9067, "lng": 72.8147, "type": "city"},
    "navi_mumbai": {"name": "Navi Mumbai (Vashi)", "lat": 19.0771, "lng": 72.9986, "type": "city"},
    "powai": {"name": "Powai Hiranandani", "lat": 19.1197, "lng": 72.9051, "type": "suburb"},
    "bandra": {"name": "Bandra West / Sea Link", "lat": 19.0596, "lng": 72.8295, "type": "suburb"},
    "goregaon": {"name": "Goregaon Hub", "lat": 19.1663, "lng": 72.8526, "type": "suburb"},
    "kandivali": {"name": "Kandivali Link Rd", "lat": 19.2045, "lng": 72.8522, "type": "suburb"},
    "dahisar": {"name": "Dahisar Check Naka", "lat": 19.2550, "lng": 72.8650, "type": "suburb"},
    "ghodbunder": {"name": "Ghodbunder Gaimukh", "lat": 19.2600, "lng": 72.9350, "type": "arterial"},
    "jvlr": {"name": "JVLR Expressway Link", "lat": 19.1300, "lng": 72.9100, "type": "arterial"},
    "sion": {"name": "Sion Circle", "lat": 19.0390, "lng": 72.8619, "type": "transit", "flood_basin": True},
}


def build_mmr_road_network() -> nx.DiGraph:
    """Builds a directed weighted road graph for Mumbai Metropolitan Region."""
    g = nx.DiGraph()

    for node_id, data in MMR_NODES.items():
        g.add_node(node_id, **data)

    # Road Artery Connections: (u, v, dist_km, base_time_min, route_type)
    edges = [
        # Ghodbunder Northern Corridor (Thane <-> Borivali)
        ("thane", "ghodbunder", 12.0, 18, "expressway"),
        ("ghodbunder", "thane", 12.0, 18, "expressway"),
        ("ghodbunder", "dahisar", 7.0, 11, "expressway"),
        ("dahisar", "ghodbunder", 7.0, 11, "expressway"),
        ("dahisar", "borivali", 5.0, 8, "arterial"),
        ("borivali", "dahisar", 5.0, 8, "arterial"),

        # Western Express Highway (WEH) Spine (Dahisar -> Bandra)
        ("borivali", "kandivali", 4.0, 7, "highway"),
        ("kandivali", "borivali", 4.0, 7, "highway"),
        ("kandivali", "goregaon", 6.0, 10, "highway"),
        ("goregaon", "kandivali", 6.0, 10, "highway"),
        ("goregaon", "andheri", 7.0, 12, "highway"),
        ("andheri", "goregaon", 7.0, 12, "highway"),
        ("andheri", "airport", 4.0, 8, "highway"),
        ("airport", "andheri", 4.0, 8, "highway"),
        ("airport", "bandra", 6.0, 11, "highway"),
        ("bandra", "airport", 6.0, 11, "highway"),
        ("bandra", "dadar", 5.0, 10, "highway"),
        ("dadar", "bandra", 5.0, 10, "highway"),
        ("dadar", "colaba", 12.0, 20, "arterial"),
        ("colaba", "dadar", 12.0, 20, "arterial"),

        # Eastern Express Highway (EEH) Spine (Thane -> Sion -> South)
        ("thane", "mulund", 6.0, 9, "highway"),
        ("mulund", "thane", 6.0, 9, "highway"),
        ("mulund", "ghatkopar", 10.0, 14, "highway"),
        ("ghatkopar", "mulund", 10.0, 14, "highway"),
        ("ghatkopar", "sion", 6.0, 10, "highway"),
        ("sion", "ghatkopar", 6.0, 10, "highway"),
        ("sion", "dadar", 4.0, 8, "arterial"),
        ("dadar", "sion", 4.0, 8, "arterial"),

        # East-West Arterial Links (JVLR, SCLR, BKC Connectors)
        ("ghatkopar", "jvlr", 5.0, 9, "arterial"),
        ("jvlr", "ghatkopar", 5.0, 9, "arterial"),
        ("jvlr", "powai", 4.0, 7, "arterial"),
        ("powai", "jvlr", 4.0, 7, "arterial"),
        ("powai", "andheri", 7.0, 12, "arterial"),
        ("andheri", "powai", 7.0, 12, "arterial"),

        ("airport", "bkc", 5.0, 10, "arterial"),
        ("bkc", "airport", 5.0, 10, "arterial"),
        ("bkc", "kurla", 3.5, 8, "arterial"),
        ("kurla", "bkc", 3.5, 8, "arterial"),
        ("kurla", "ghatkopar", 4.5, 9, "arterial"),
        ("ghatkopar", "kurla", 4.5, 9, "arterial"),
        ("bkc", "bandra", 4.0, 8, "arterial"),
        ("bandra", "bkc", 4.0, 8, "arterial"),
        ("bkc", "sion", 4.5, 9, "arterial"),
        ("sion", "bkc", 4.5, 9, "arterial"),
        
        # Trans-Harbour Links
        ("ghatkopar", "navi_mumbai", 14.0, 18, "highway"),
        ("navi_mumbai", "ghatkopar", 14.0, 18, "highway"),
        ("thane", "navi_mumbai", 18.0, 24, "highway"),
        ("navi_mumbai", "thane", 18.0, 24, "highway"),
    ]

    for u, v, dist, t_min, r_type in edges:
        g.add_edge(u, v, distance_km=dist, base_time_min=t_min, route_type=r_type)

    return g
