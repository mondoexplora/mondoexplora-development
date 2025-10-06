#!/usr/bin/env python3
"""
Add Route Helper
Easily add new routes to popular_routes.json
"""

import json
import os
from typing import Dict, Any

def load_popular_routes() -> Dict[str, Any]:
    """
    Load popular routes from JSON file
    """
    try:
        with open('data/popular_routes.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"popular_routes": []}

def save_popular_routes(data: Dict[str, Any]):
    """
    Save popular routes to JSON file
    """
    os.makedirs("data", exist_ok=True)
    with open('data/popular_routes.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_route_type() -> str:
    """
    Get route type from user
    """
    print("\n📋 Route Types:")
    print("1. international_air - Only flights (international)")
    print("2. international_coastal - Flights + ferries (coastal)")
    print("3. domestic_major - All modes (major cities)")
    print("4. domestic_regional - Train, bus, car (regional)")
    print("5. island_hopping - Flights + ferries (islands)")
    
    while True:
        choice = input("\nSelect route type (1-5): ").strip()
        types = {
            "1": "international_air",
            "2": "international_coastal", 
            "3": "domestic_major",
            "4": "domestic_regional",
            "5": "island_hopping"
        }
        if choice in types:
            return types[choice]
        print("❌ Invalid choice. Please select 1-5.")

def get_providers() -> Dict[str, Any]:
    """
    Get provider information from user
    """
    providers = {}
    
    print("\n✈️ Flight Providers (press Enter to skip):")
    flight_providers = []
    while True:
        name = input("Airline name (or Enter to finish): ").strip()
        if not name:
            break
        website = input(f"Website for {name}: ").strip()
        direct = input("Direct flights? (y/n): ").strip().lower() == 'y'
        flight_providers.append({
            "name": name,
            "website": website,
            "direct": direct
        })
    
    if flight_providers:
        providers["flight"] = {"providers": flight_providers}
        origin_airport = input("Origin airport (e.g., 'London Heathrow (LHR)'): ").strip()
        dest_airport = input("Destination airport (e.g., 'Paris Charles de Gaulle (CDG)'): ").strip()
        if origin_airport and dest_airport:
            providers["flight"]["airports"] = {
                "origin": origin_airport,
                "destination": dest_airport
            }
    
    print("\n🚄 Train Providers (press Enter to skip):")
    train_providers = []
    while True:
        name = input("Train operator name (or Enter to finish): ").strip()
        if not name:
            break
        website = input(f"Website for {name}: ").strip()
        direct = input("Direct trains? (y/n): ").strip().lower() == 'y'
        train_providers.append({
            "name": name,
            "website": website,
            "direct": direct
        })
    
    if train_providers:
        providers["train"] = {"providers": train_providers}
        origin_station = input("Origin station (e.g., 'St Pancras International'): ").strip()
        dest_station = input("Destination station (e.g., 'Gare du Nord'): ").strip()
        if origin_station and dest_station:
            providers["train"]["stations"] = {
                "origin": origin_station,
                "destination": dest_station
            }
    
    print("\n🚌 Bus Providers (press Enter to skip):")
    bus_providers = []
    while True:
        name = input("Bus company name (or Enter to finish): ").strip()
        if not name:
            break
        website = input(f"Website for {name}: ").strip()
        direct = input("Direct buses? (y/n): ").strip().lower() == 'y'
        bus_providers.append({
            "name": name,
            "website": website,
            "direct": direct
        })
    
    if bus_providers:
        providers["bus"] = {"providers": bus_providers}
    
    print("\n⛴️ Ferry Providers (press Enter to skip):")
    ferry_providers = []
    while True:
        name = input("Ferry operator name (or Enter to finish): ").strip()
        if not name:
            break
        website = input(f"Website for {name}: ").strip()
        direct = input("Direct ferries? (y/n): ").strip().lower() == 'y'
        ferry_providers.append({
            "name": name,
            "website": website,
            "direct": direct
        })
    
    if ferry_providers:
        providers["ferry"] = {"providers": ferry_providers}
        origin_port = input("Origin port (e.g., 'Barcelona Port'): ").strip()
        dest_port = input("Destination port (e.g., 'Ibiza Port'): ").strip()
        if origin_port and dest_port:
            providers["ferry"]["ports"] = {
                "origin": origin_port,
                "destination": dest_port
            }
    
    return providers

def add_route():
    """
    Add a new route interactively
    """
    print("🚀 Add New Route")
    print("=" * 50)
    
    # Get basic route info
    origin = input("Origin city: ").strip().lower().replace(" ", "_")
    destination = input("Destination city: ").strip().lower().replace(" ", "_")
    distance = input("Distance (e.g., '500 km'): ").strip()
    route_type = get_route_type()
    
    # Get providers
    providers = get_providers()
    
    # Create route object
    new_route = {
        "origin": origin,
        "destination": destination,
        "type": route_type,
        "distance": distance,
        "providers": providers
    }
    
    # Load existing routes
    data = load_popular_routes()
    
    # Check if route already exists
    existing_routes = data.get("popular_routes", [])
    route_key = f"{origin}_{destination}"
    
    for route in existing_routes:
        if route.get("origin") == origin and route.get("destination") == destination:
            print(f"\n⚠️  Route {route_key} already exists!")
            overwrite = input("Overwrite? (y/n): ").strip().lower()
            if overwrite != 'y':
                print("❌ Route not added.")
                return
            # Remove existing route
            existing_routes = [r for r in existing_routes if not (r.get("origin") == origin and r.get("destination") == destination)]
            break
    
    # Add new route
    existing_routes.append(new_route)
    data["popular_routes"] = existing_routes
    
    # Save to file
    save_popular_routes(data)
    
    print(f"\n✅ Route {route_key} added successfully!")
    print(f"📁 Updated: data/popular_routes.json")
    print(f"📋 Total routes: {len(existing_routes)}")
    
    # Ask if user wants to generate route files
    generate = input("\nGenerate route files now? (y/n): ").strip().lower()
    if generate == 'y':
        print("\n🔄 Generating route files...")
        os.system("python3 generate_popular_routes.py")

def list_routes():
    """
    List all existing routes
    """
    data = load_popular_routes()
    routes = data.get("popular_routes", [])
    
    if not routes:
        print("📋 No routes found in popular_routes.json")
        return
    
    print(f"\n📋 Found {len(routes)} routes:")
    print("=" * 50)
    
    for i, route in enumerate(routes, 1):
        origin = route["origin"].replace("_", " ").title()
        destination = route["destination"].replace("_", " ").title()
        distance = route.get("distance", "N/A")
        route_type = route.get("type", "N/A")
        
        print(f"{i:2d}. {origin} → {destination}")
        print(f"    Distance: {distance} | Type: {route_type}")
        
        # Show available modes
        providers = route.get("providers", {})
        modes = []
        if "flight" in providers:
            modes.append("✈️ Flight")
        if "train" in providers:
            modes.append("🚄 Train")
        if "bus" in providers:
            modes.append("🚌 Bus")
        if "ferry" in providers:
            modes.append("⛴️ Ferry")
        
        if modes:
            print(f"    Modes: {', '.join(modes)}")
        print()

def main():
    """
    Main function
    """
    print("🗺️  Route Management Tool")
    print("=" * 50)
    
    while True:
        print("\nOptions:")
        print("1. Add new route")
        print("2. List all routes")
        print("3. Generate route files")
        print("4. Exit")
        
        choice = input("\nSelect option (1-4): ").strip()
        
        if choice == "1":
            add_route()
        elif choice == "2":
            list_routes()
        elif choice == "3":
            print("\n🔄 Generating route files...")
            os.system("python3 generate_popular_routes.py")
        elif choice == "4":
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please select 1-4.")

if __name__ == "__main__":
    main() 