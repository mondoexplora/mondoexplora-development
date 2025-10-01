#!/usr/bin/env python3
"""
Enhanced Route Data Generator
Generates detailed JSON files with real provider links and comprehensive travel information
"""

import json
import os
from typing import List, Dict, Any

# Enhanced travel mode definitions with real providers
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

# Route-specific provider information
ROUTE_PROVIDERS = {
    "bangkok_bali": {
        "flight": {
            "providers": [
                {"name": "Thai Airways", "website": "https://www.thaiairways.com", "direct": True},
                {"name": "Garuda Indonesia", "website": "https://www.garuda-indonesia.com", "direct": True},
                {"name": "AirAsia", "website": "https://www.airasia.com", "direct": True},
                {"name": "Lion Air", "website": "https://www.lionair.co.id", "direct": True}
            ],
            "airports": {
                "origin": "Bangkok Suvarnabhumi (BKK)",
                "destination": "Denpasar Ngurah Rai (DPS)"
            }
        },
        "ferry": {
            "providers": [
                {"name": "Pelni", "website": "https://www.pelni.co.id", "direct": False},
                {"name": "Singapore Cruise Centre", "website": "https://www.singaporecruise.com", "direct": False}
            ],
            "ports": {
                "origin": "Bangkok Port",
                "destination": "Benoa Port, Bali"
            }
        }
    },
    "sydney_melbourne": {
        "flight": {
            "providers": [
                {"name": "Qantas", "website": "https://www.qantas.com", "direct": True},
                {"name": "Virgin Australia", "website": "https://www.virginaustralia.com", "direct": True},
                {"name": "Jetstar", "website": "https://www.jetstar.com", "direct": True}
            ],
            "airports": {
                "origin": "Sydney Airport (SYD)",
                "destination": "Melbourne Airport (MEL)"
            }
        },
        "train": {
            "providers": [
                {"name": "NSW TrainLink", "website": "https://transportnsw.info", "direct": True}
            ],
            "stations": {
                "origin": "Central Station, Sydney",
                "destination": "Southern Cross Station, Melbourne"
            }
        },
        "bus": {
            "providers": [
                {"name": "Greyhound Australia", "website": "https://www.greyhound.com.au", "direct": True},
                {"name": "Firefly Express", "website": "https://www.fireflyexpress.com.au", "direct": True}
            ],
            "stations": {
                "origin": "Central Station, Sydney",
                "destination": "Southern Cross Station, Melbourne"
            }
        },
        "car": {
            "providers": [
                {"name": "Hertz", "website": "https://www.hertz.com.au", "airport": True},
                {"name": "Avis", "website": "https://www.avis.com.au", "airport": True},
                {"name": "Budget", "website": "https://www.budget.com.au", "airport": True},
                {"name": "Thrifty", "website": "https://www.thrifty.com.au", "airport": True}
            ]
        }
    },
    "london_paris": {
        "flight": {
            "providers": [
                {"name": "British Airways", "website": "https://www.britishairways.com", "direct": True},
                {"name": "Air France", "website": "https://www.airfrance.com", "direct": True},
                {"name": "EasyJet", "website": "https://www.easyjet.com", "direct": True}
            ],
            "airports": {
                "origin": "London Heathrow (LHR)",
                "destination": "Paris Charles de Gaulle (CDG)"
            }
        },
        "train": {
            "providers": [
                {"name": "Eurostar", "website": "https://www.eurostar.com", "direct": True}
            ],
            "stations": {
                "origin": "St Pancras International, London",
                "destination": "Gare du Nord, Paris"
            }
        },
        "bus": {
            "providers": [
                {"name": "FlixBus", "website": "https://www.flixbus.com", "direct": True},
                {"name": "Eurolines", "website": "https://www.eurolines.com", "direct": True}
            ],
            "stations": {
                "origin": "Victoria Coach Station, London",
                "destination": "Gare de Bercy, Paris"
            }
        },
        "car": {
            "providers": [
                {"name": "Europcar", "website": "https://www.europcar.com", "airport": True},
                {"name": "Sixt", "website": "https://www.sixt.com", "airport": True},
                {"name": "Hertz", "website": "https://www.hertz.com", "airport": True}
            ]
        }
    },
    "tokyo_osaka": {
        "flight": {
            "providers": [
                {"name": "Japan Airlines", "website": "https://www.jal.com", "direct": True},
                {"name": "All Nippon Airways", "website": "https://www.ana.co.jp", "direct": True},
                {"name": "Peach Aviation", "website": "https://www.flypeach.com", "direct": True}
            ],
            "airports": {
                "origin": "Tokyo Haneda (HND)",
                "destination": "Osaka Kansai (KIX)"
            }
        },
        "train": {
            "providers": [
                {"name": "JR Shinkansen", "website": "https://japanrailpass.net", "direct": True}
            ],
            "stations": {
                "origin": "Tokyo Station",
                "destination": "Shin-Osaka Station"
            }
        },
        "bus": {
            "providers": [
                {"name": "Willer Express", "website": "https://willerexpress.com", "direct": True},
                {"name": "JR Bus", "website": "https://www.jrbuskanto.co.jp", "direct": True}
            ],
            "stations": {
                "origin": "Tokyo Station",
                "destination": "Osaka Station"
            }
        },
        "car": {
            "providers": [
                {"name": "Toyota Rent a Car", "website": "https://rent.toyota.co.jp", "airport": True},
                {"name": "Nissan Rent a Car", "website": "https://nissan-rentacar.com", "airport": True},
                {"name": "Times Car Rental", "website": "https://www.timescar-rental.com", "airport": True}
            ]
        }
    },
    "barcelona_ibiza": {
        "flight": {
            "providers": [
                {"name": "Iberia", "website": "https://www.iberia.com", "direct": True},
                {"name": "Vueling", "website": "https://www.vueling.com", "direct": True},
                {"name": "Air Europa", "website": "https://www.aireuropa.com", "direct": True}
            ],
            "airports": {
                "origin": "Barcelona El Prat (BCN)",
                "destination": "Ibiza Airport (IBZ)"
            }
        },
        "ferry": {
            "providers": [
                {"name": "Balearia", "website": "https://www.balearia.com", "direct": True},
                {"name": "Trasmediterranea", "website": "https://www.trasmediterranea.es", "direct": True}
            ],
            "ports": {
                "origin": "Barcelona Port",
                "destination": "Ibiza Port"
            }
        }
    }
}

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

def generate_route_data(origin: str, destination: str, route_type: str, 
                       distance: str = "", custom_modes: List[str] | None = None,
                       custom_tips: List[str] | None = None) -> Dict[str, Any]:
    """
    Generate enhanced route data JSON structure with real providers
    """
    template = ROUTE_TEMPLATES.get(route_type, ROUTE_TEMPLATES["domestic_major"])
    
    # Use custom modes if provided, otherwise use template
    available_modes = custom_modes if custom_modes else template["modes"]
    
    # Get route-specific provider data
    route_key = f"{origin.lower()}_{destination.lower()}"
    route_providers = ROUTE_PROVIDERS.get(route_key, {})
    
    # Build enhanced travel modes with real providers
    travel_modes = []
    for mode_id in available_modes:
        if mode_id in TRAVEL_MODES:
            mode_data = TRAVEL_MODES[mode_id].copy()
            
            # Add route-specific provider information
            if mode_id in route_providers:
                mode_data.update(route_providers[mode_id])
            
            travel_modes.append(mode_data)
    
    # Use custom tips if provided, otherwise use template
    quick_tips = custom_tips if custom_tips else template["default_tips"]
    
    return {
        "route": {
            "origin": origin.lower(),
            "destination": destination.lower(),
            "distance": distance,
            "available_modes": available_modes
        },
        "travel_modes": travel_modes,
        "quick_tips": quick_tips
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
    Main function to generate enhanced route files
    """
    print("🚀 Generating Enhanced Route Data Files...")
    
    # Enhanced sample routes with real provider data
    sample_routes = [
        {
            "origin": "bangkok",
            "destination": "bali", 
            "type": "international_coastal",
            "distance": "2800 km",
            "custom_tips": [
                "Book flights 2-3 months in advance for best prices",
                "Ferry option is scenic but much slower",
                "Consider visa requirements for Indonesia",
                "Best time to visit: April to October"
            ]
        },
        {
            "origin": "sydney",
            "destination": "melbourne",
            "type": "domestic_major", 
            "distance": "880 km",
            "custom_tips": [
                "Flights are fastest but most expensive",
                "Train offers the most scenic route",
                "Bus is cheapest but longest journey", 
                "Car allows flexibility to explore coastal towns",
                "Book in advance for better prices"
            ]
        },
        {
            "origin": "london",
            "destination": "paris",
            "type": "international_air",
            "distance": "344 km",
            "custom_modes": ["flight", "train", "bus", "car"],
            "custom_tips": [
                "Eurostar train is fastest and most convenient",
                "Flights are quick but require airport transfers",
                "Bus is cheapest but slowest option",
                "Car allows flexibility to explore countryside"
            ]
        },
        {
            "origin": "tokyo",
            "destination": "osaka",
            "type": "domestic_major",
            "distance": "400 km",
            "custom_tips": [
                "Shinkansen bullet train is fastest and most comfortable",
                "Flights are quick but require airport transfers",
                "Bus is budget-friendly alternative",
                "Car allows exploration of countryside"
            ]
        },
        {
            "origin": "barcelona",
            "destination": "ibiza",
            "type": "island_hopping",
            "distance": "200 km",
            "custom_tips": [
                "Ferries are scenic but slower than flights",
                "Flights are faster but more expensive",
                "Check ferry schedules in advance",
                "Best time to visit: May to October"
            ]
        }
    ]
    
    # Generate each route
    for route in sample_routes:
        route_data = generate_route_data(
            origin=route["origin"],
            destination=route["destination"],
            route_type=route["type"],
            distance=route["distance"],
            custom_modes=route.get("custom_modes"),
            custom_tips=route.get("custom_tips")
        )
        
        save_route_file(route["origin"], route["destination"], route_data)
    
    print(f"\n🎉 Generated {len(sample_routes)} enhanced route files!")
    print("📁 Files saved in: data/routes/")
    print("\n📋 Available route types:")
    for route_type, template in ROUTE_TEMPLATES.items():
        print(f"  • {route_type}: {', '.join(template['modes'])}")
    
    print("\n🔗 Real provider links included for:")
    print("  • Airlines with direct booking links")
    print("  • Train operators with reservation systems")
    print("  • Bus companies with online booking")
    print("  • Car rental agencies with airport locations")
    print("  • Ferry operators with schedules")

if __name__ == "__main__":
    main() 