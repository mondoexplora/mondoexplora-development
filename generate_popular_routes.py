#!/usr/bin/env python3
"""
Popular Routes Generator
Reads routes from JSON file and generates individual route files
"""

import json
import os
from typing import List, Dict, Any

def load_popular_routes() -> List[Dict[str, Any]]:
    """
    Load popular routes from JSON file
    """
    # Try to load from researched routes first
    try:
        with open('data/researched_routes.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            routes = data.get('popular_routes', [])
            if routes:
                print("📋 Loaded routes from researched data")
                return routes
    except FileNotFoundError:
        pass
    
    # Fallback to original popular routes
    try:
        with open('data/popular_routes.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            routes = data.get('popular_routes', [])
            if routes:
                print("📋 Loaded routes from popular_routes.json")
                return routes
    except FileNotFoundError:
        print("❌ Error: No route files found!")
        print("Please run: python3 research_routes.py")
        return []
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in route files: {e}")
        return []
    
    return []

# Template for different types of routes
ROUTE_TEMPLATES = {
    "international_air": {
        "modes": ["flight"],
        "default_tips": [
            "Book flights 2-3 months in advance for best prices",
            "Check visa requirements for your destination",
            "Consider travel insurance for international trips"
        ]
    },
    "international_coastal": {
        "modes": ["flight", "ferry"],
        "default_tips": [
            "Flights are fastest but ferries offer scenic views",
            "Ferry schedules may be seasonal",
            "Check weather conditions for ferry travel"
        ]
    },
    "domestic_major": {
        "modes": ["flight", "train", "bus", "car"],
        "default_tips": [
            "Flights are fastest for long distances",
            "Trains offer scenic routes and comfort",
            "Buses are cheapest but slowest",
            "Car gives you flexibility to explore"
        ]
    },
    "domestic_regional": {
        "modes": ["train", "bus", "car"],
        "default_tips": [
            "Trains are comfortable and scenic",
            "Buses are budget-friendly",
            "Car allows you to explore along the way"
        ]
    },
    "island_hopping": {
        "modes": ["flight", "ferry"],
        "default_tips": [
            "Ferries are scenic but slower",
            "Flights are faster but more expensive",
            "Check ferry schedules in advance"
        ]
    }
}

# Travel mode definitions with booking links
TRAVEL_MODES = {
    "flight": {
        "icon": "✈️",
        "name": "Flight",
        "description": "Fastest option for long distances",
        "estimated_time": "2-8 hours",
        "estimated_cost": "$200-800",
        "frequency": "Daily",
        "notes": "Most popular for international travel",
        "booking_links": {
            "skyscanner": "https://www.skyscanner.com",
            "kayak": "https://www.kayak.com",
            "google_flights": "https://www.google.com/travel/flights"
        }
    },
    "train": {
        "icon": "🚄",
        "name": "Train",
        "description": "Scenic and comfortable for medium distances",
        "estimated_time": "4-12 hours",
        "estimated_cost": "$50-300",
        "frequency": "Daily",
        "notes": "Great for scenic routes",
        "booking_links": {
            "trainline": "https://www.trainline.com",
            "raileurope": "https://www.raileurope.com",
            "seat61": "https://www.seat61.com"
        }
    },
    "bus": {
        "icon": "🚌",
        "name": "Bus",
        "description": "Budget-friendly option for shorter distances",
        "estimated_time": "6-24 hours",
        "estimated_cost": "$20-100",
        "frequency": "Multiple daily",
        "notes": "Cheapest option available",
        "booking_links": {
            "flixbus": "https://www.flixbus.com",
            "megabus": "https://www.megabus.com",
            "greyhound": "https://www.greyhound.com"
        }
    },
    "car": {
        "icon": "🚗",
        "name": "Car",
        "description": "Flexible and convenient for road trips",
        "estimated_time": "8-20 hours",
        "estimated_cost": "$100-400",
        "frequency": "Anytime",
        "notes": "Maximum flexibility and freedom",
        "booking_links": {
            "rentalcars": "https://www.rentalcars.com",
            "kayak_cars": "https://www.kayak.com/cars",
            "expedia_cars": "https://www.expedia.com/cars"
        }
    },
    "ferry": {
        "icon": "⛴️",
        "name": "Ferry",
        "description": "Scenic water travel between coastal destinations",
        "estimated_time": "1-6 hours",
        "estimated_cost": "$30-150",
        "frequency": "Daily/Weekly",
        "notes": "Scenic but weather dependent",
        "booking_links": {
            "directferries": "https://www.directferries.com",
            "ferryhopper": "https://www.ferryhopper.com"
        }
    }
}

def generate_route_data(route_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate route data JSON structure with real providers
    """
    template = ROUTE_TEMPLATES.get(route_info["type"], ROUTE_TEMPLATES["domestic_major"])
    available_modes = template["modes"]
    
    # Build enhanced travel modes with real providers
    travel_modes = []
    for mode_id in available_modes:
        if mode_id in TRAVEL_MODES:
            mode_data = TRAVEL_MODES[mode_id].copy()
            
            # Add route-specific provider information
            if "providers" in route_info and mode_id in route_info["providers"]:
                mode_data.update(route_info["providers"][mode_id])
            
            travel_modes.append(mode_data)
    
    return {
        "route": {
            "origin": route_info["origin"],
            "destination": route_info["destination"],
            "distance": route_info["distance"],
            "available_modes": available_modes
        },
        "travel_modes": travel_modes,
        "quick_tips": template["default_tips"]
    }

def save_route_file(origin: str, destination: str, route_data: Dict[str, Any]):
    """
    Save route data to JSON file
    """
    # Create routes directory if it doesn't exist
    os.makedirs("data/routes", exist_ok=True)
    
    # Generate filename
    filename = f"{origin.lower()}_{destination.lower()}.json"
    filepath = os.path.join("data/routes", filename)
    
    # Save JSON file
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(route_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created: {filepath}")

def main():
    """
    Main function to generate popular route files
    """
    print("🚀 Loading Popular Routes from JSON file...")
    
    # Load routes from JSON file
    popular_routes = load_popular_routes()
    
    if not popular_routes:
        print("❌ No routes found. Please check your popular_routes.json file.")
        return
    
    print(f"📋 Found {len(popular_routes)} routes in popular_routes.json")
    
    # Generate each route
    for route in popular_routes:
        route_data = generate_route_data(route)
        save_route_file(route["origin"], route["destination"], route_data)
    
    print(f"\n🎉 Generated {len(popular_routes)} route files!")
    print("📁 Files saved in: data/routes/")
    
    print("\n🌍 Routes loaded from popular_routes.json:")
    regions = {}
    for route in popular_routes:
        origin = route["origin"].replace("_", " ").title()
        destination = route["destination"].replace("_", " ").title()
        route_key = f"{origin} → {destination}"
        
        # Determine region based on origin
        if any(city in route["origin"] for city in ["london", "paris", "barcelona", "berlin", "amsterdam", "rome", "madrid", "munich"]):
            region = "Europe"
        elif any(city in route["origin"] for city in ["tokyo", "seoul", "singapore", "hong_kong", "kyoto", "busan", "bangkok", "taipei"]):
            region = "Asia"
        elif any(city in route["origin"] for city in ["new_york", "miami", "toronto", "mexico_city", "los_angeles", "orlando", "montreal", "cancun"]):
            region = "Americas"
        elif any(city in route["origin"] for city in ["sydney", "auckland", "gold_coast", "wellington"]):
            region = "Australia & Oceania"
        elif any(city in route["origin"] for city in ["cairo", "johannesburg", "alexandria", "cape_town"]):
            region = "Africa"
        else:
            region = "Other"
        
        if region not in regions:
            regions[region] = []
        regions[region].append(route_key)
    
    for region, routes in regions.items():
        print(f"  • {region}: {', '.join(routes[:3])}{'...' if len(routes) > 3 else ''}")
    
    print("\n🔗 Real provider links included for:")
    print("  • Airlines with direct booking links")
    print("  • Train operators with reservation systems")
    print("  • Bus companies with online booking")
    print("  • Car rental agencies with airport locations")
    
    print("\n📝 To add more routes:")
    print("  1. Edit data/popular_routes.json")
    print("  2. Run: python3 generate_popular_routes.py")

if __name__ == "__main__":
    main() 