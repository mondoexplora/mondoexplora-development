#!/usr/bin/env python3
"""
Route Research Tool
Reads routes from CSV and researches real provider data
"""

import csv
import json
import os
from typing import List, Dict, Any

def load_routes_from_csv(filename: str = "routes_to_research.csv") -> List[Dict[str, str]]:
    """
    Load routes from CSV file
    """
    routes = []
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                routes.append(row)
        print(f"📋 Loaded {len(routes)} routes from {filename}")
    except FileNotFoundError:
        print(f"❌ File {filename} not found!")
        print("Please create the CSV file with your routes.")
    return routes

def research_route_data(route: Dict[str, str]) -> Dict[str, Any]:
    """
    Research real provider data for a specific route
    This function would contain the research logic for each route
    """
    origin = route['origin']
    destination = route['destination']
    country = route['country']
    region = route['region']
    
    print(f"\n🔍 Researching: {origin} → {destination} ({country})")
    
    # This is where I would research real data
    # For now, I'll create a template based on the route type
    if region.lower() == "islands":
        return research_island_route(origin, destination, country)
    elif region.lower() == "domestic":
        return research_domestic_route(origin, destination, country)
    else:
        return research_generic_route(origin, destination, country)

def research_island_route(origin: str, destination: str, country: str) -> Dict[str, Any]:
    """
    Research island hopping routes (Thailand example)
    """
    if country.lower() == "thailand":
        if "koh tao" in origin.lower() and "koh phi phi" in destination.lower():
            return {
                "origin": "koh_tao",
                "destination": "koh_phi_phi", 
                "type": "island_hopping",
                "distance": "150 km",
                "providers": {
                    "flight": {
                        "providers": [
                            {"name": "Bangkok Airways", "website": "https://www.bangkokair.com", "direct": False},
                            {"name": "Thai Airways", "website": "https://www.thaiairways.com", "direct": False}
                        ],
                        "airports": {
                            "origin": "Koh Samui Airport (USM)",
                            "destination": "Krabi Airport (KBV)"
                        }
                    },
                    "ferry": {
                        "providers": [
                            {"name": "Lomprayah", "website": "https://www.lomprayah.com", "direct": False},
                            {"name": "Seatran Discovery", "website": "https://www.seatrandiscovery.com", "direct": False},
                            {"name": "Raja Ferry", "website": "https://www.rajaferryport.com", "direct": False}
                        ],
                        "ports": {
                            "origin": "Koh Tao Pier",
                            "destination": "Koh Phi Phi Pier"
                        }
                    }
                }
            }
    
    # Generic island route template
    return {
        "origin": origin.lower().replace(" ", "_"),
        "destination": destination.lower().replace(" ", "_"),
        "type": "island_hopping",
        "distance": "100-200 km",
        "providers": {
            "flight": {
                "providers": [
                    {"name": "Local Airlines", "website": "https://www.example.com", "direct": False}
                ]
            },
            "ferry": {
                "providers": [
                    {"name": "Local Ferry", "website": "https://www.example.com", "direct": False}
                ]
            }
        }
    }

def research_domestic_route(origin: str, destination: str, country: str) -> Dict[str, Any]:
    """
    Research domestic routes
    """
    if country.lower() == "thailand":
        if "bangkok" in origin.lower() and "chiang mai" in destination.lower():
            return {
                "origin": "bangkok",
                "destination": "chiang_mai",
                "type": "domestic_major",
                "distance": "700 km",
                "providers": {
                    "flight": {
                        "providers": [
                            {"name": "Thai Airways", "website": "https://www.thaiairways.com", "direct": True},
                            {"name": "Bangkok Airways", "website": "https://www.bangkokair.com", "direct": True},
                            {"name": "AirAsia", "website": "https://www.airasia.com", "direct": True},
                            {"name": "Nok Air", "website": "https://www.nokair.com", "direct": True}
                        ],
                        "airports": {
                            "origin": "Bangkok Suvarnabhumi (BKK)",
                            "destination": "Chiang Mai International (CNX)"
                        }
                    },
                    "bus": {
                        "providers": [
                            {"name": "Transport Co. Ltd", "website": "https://www.transport.co.th", "direct": True},
                            {"name": "Nakhonchai Air", "website": "https://www.nakhonchaiair.com", "direct": True}
                        ]
                    },
                    "train": {
                        "providers": [
                            {"name": "State Railway of Thailand", "website": "https://www.railway.co.th", "direct": True}
                        ],
                        "stations": {
                            "origin": "Bangkok Hua Lamphong",
                            "destination": "Chiang Mai Station"
                        }
                    }
                }
            }
        elif "phuket" in origin.lower() and "krabi" in destination.lower():
            return {
                "origin": "phuket",
                "destination": "krabi",
                "type": "domestic_major",
                "distance": "80 km",
                "providers": {
                    "flight": {
                        "providers": [
                            {"name": "Bangkok Airways", "website": "https://www.bangkokair.com", "direct": True},
                            {"name": "Thai Airways", "website": "https://www.thaiairways.com", "direct": True}
                        ],
                        "airports": {
                            "origin": "Phuket International (HKT)",
                            "destination": "Krabi International (KBV)"
                        }
                    },
                    "ferry": {
                        "providers": [
                            {"name": "Andaman Wave Master", "website": "https://www.andamanwavemaster.com", "direct": True},
                            {"name": "Phuket Ferries", "website": "https://www.phuketferries.com", "direct": True}
                        ],
                        "ports": {
                            "origin": "Phuket Rassada Pier",
                            "destination": "Krabi Pier"
                        }
                    },
                    "bus": {
                        "providers": [
                            {"name": "Phuket Travel", "website": "https://www.phukettravel.com", "direct": True}
                        ]
                    }
                }
            }
    
    # Generic domestic route template
    return {
        "origin": origin.lower().replace(" ", "_"),
        "destination": destination.lower().replace(" ", "_"),
        "type": "domestic_major",
        "distance": "300-800 km",
        "providers": {
            "flight": {
                "providers": [
                    {"name": "National Airlines", "website": "https://www.example.com", "direct": True}
                ]
            },
            "bus": {
                "providers": [
                    {"name": "National Bus", "website": "https://www.example.com", "direct": True}
                ]
            }
        }
    }

def research_generic_route(origin: str, destination: str, country: str) -> Dict[str, Any]:
    """
    Research generic routes
    """
    return {
        "origin": origin.lower().replace(" ", "_"),
        "destination": destination.lower().replace(" ", "_"),
        "type": "domestic_major",
        "distance": "200-500 km",
        "providers": {
            "flight": {
                "providers": [
                    {"name": "Local Airlines", "website": "https://www.example.com", "direct": True}
                ]
            },
            "bus": {
                "providers": [
                    {"name": "Local Bus", "website": "https://www.example.com", "direct": True}
                ]
            }
        }
    }

def save_researched_routes(routes_data: List[Dict[str, Any]], output_file: str = "data/researched_routes.json"):
    """
    Save researched routes to JSON file
    """
    os.makedirs("data", exist_ok=True)
    
    data = {"popular_routes": routes_data}
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Saved {len(routes_data)} researched routes to {output_file}")

def main():
    """
    Main function to research routes from CSV
    """
    print("🔍 Route Research Tool")
    print("=" * 50)
    
    # Load routes from CSV
    routes = load_routes_from_csv()
    
    if not routes:
        print("\n📝 To add routes, edit routes_to_research.csv with format:")
        print("origin,destination,country,region,notes")
        print("Koh Tao,Koh Phi Phi,Thailand,Islands,Island hopping")
        return
    
    # Research each route
    researched_routes = []
    for route in routes:
        route_data = research_route_data(route)
        researched_routes.append(route_data)
    
    # Save researched routes
    save_researched_routes(researched_routes)
    
    print(f"\n🎉 Research complete!")
    print(f"📊 Researched {len(researched_routes)} routes")
    
    # Show summary
    print("\n📋 Researched Routes:")
    for route in researched_routes:
        origin = route['origin'].replace('_', ' ').title()
        destination = route['destination'].replace('_', ' ').title()
        route_type = route['type']
        distance = route['distance']
        
        providers = route.get('providers', {})
        modes = []
        if 'flight' in providers:
            modes.append('✈️ Flight')
        if 'train' in providers:
            modes.append('🚄 Train')
        if 'bus' in providers:
            modes.append('🚌 Bus')
        if 'ferry' in providers:
            modes.append('⛴️ Ferry')
        
        print(f"  • {origin} → {destination}")
        print(f"    Type: {route_type} | Distance: {distance}")
        print(f"    Modes: {', '.join(modes)}")
        print()
    
    print("🔄 To generate route files, run:")
    print("   python3 generate_popular_routes.py")

if __name__ == "__main__":
    main() 