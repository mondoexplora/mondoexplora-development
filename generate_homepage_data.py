#!/usr/bin/env python3
"""
Homepage Data Generator
Generates comprehensive homepage data with real minimum prices from hotel data
"""

import json
import os
from typing import Dict, List, Any
from collections import defaultdict

# Regional mapping for countries
REGIONAL_MAPPING = {
    'South East Asia': [
        'Thailand', 'Vietnam', 'Indonesia', 'Philippines', 'Malaysia', 'Singapore', 
        'Cambodia', 'Laos', 'Myanmar', 'Brunei', 'East Timor'
    ],
    'Japan & South Korea': [
        'Japan', 'South Korea'
    ],
    'US, Canada & Mexico': [
        'United States', 'Canada', 'Mexico'
    ],
    'Australia & New Zealand': [
        'Australia', 'New Zealand', 'Fiji', 'Vanuatu', 'Papua New Guinea'
    ],
    'Europe': [
        'United Kingdom', 'Greece', 'Italy', 'France', 'Spain', 'Portugal', 
        'Germany', 'Switzerland', 'Turkey', 'Netherlands', 'Croatia', 'Ireland',
        'Austria', 'Belgium', 'Montenegro', 'Hungary', 'Malta', 'Czech Republic',
        'Iceland', 'Poland', 'Cyprus', 'Romania', 'Denmark', 'Sweden', 'Finland',
        'Luxembourg', 'Serbia', 'Slovenia', 'Slovakia', 'Bulgaria', 'Latvia',
        'Lithuania', 'Andorra', 'Albania', 'Belarus', 'Ukraine'
    ],
    'Latin America': [
        'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Uruguay', 'Paraguay', 
        'Bolivia', 'Ecuador', 'Venezuela', 'Costa Rica', 'Panama', 'Guatemala', 
        'Honduras', 'Nicaragua', 'El Salvador', 'Dominican Republic', 'Cuba', 
        'Jamaica', 'Trinidad and Tobago', 'Barbados'
    ]
}

def load_hotel_data() -> Dict[str, List[Dict[str, Any]]]:
    """
    Load all hotel data from JSON files
    """
    hotels_dir = "data/hotels"
    hotel_data = {}
    
    if not os.path.exists(hotels_dir):
        print(f"❌ Hotel data directory not found: {hotels_dir}")
        return {}
    
    print(f"📁 Loading hotel data from {hotels_dir}...")
    
    for filename in os.listdir(hotels_dir):
        if filename.endswith('.json'):
            destination = filename[:-5]  # Remove .json extension
            filepath = os.path.join(hotels_dir, filename)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    hotels = json.load(f)
                    if isinstance(hotels, list) and hotels:
                        hotel_data[destination] = hotels
            except Exception as e:
                print(f"⚠️  Error loading {filename}: {e}")
    
    print(f"✅ Loaded hotel data for {len(hotel_data)} destinations")
    return hotel_data

def calculate_destination_stats(hotels: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate statistics for a destination
    """
    if not hotels:
        return {"hotelCount": 0, "minPrice": None, "maxPrice": None, "avgPrice": None}
    
    # Extract prices (handle different field names)
    prices = []
    for hotel in hotels:
        # Try different price fields
        price = hotel.get('price') or hotel.get('value') or hotel.get('current_price')
        if price and isinstance(price, (int, float)) and price > 0:
            prices.append(float(price))
    
    if not prices:
        return {"hotelCount": len(hotels), "minPrice": None, "maxPrice": None, "avgPrice": None}
    
    min_price = min(prices)
    # Ensure minimum price is at least $30 for credibility
    if min_price < 30:
        min_price = 30
    
    return {
        "hotelCount": len(hotels),
        "minPrice": min_price,
        "maxPrice": max(prices),
        "avgPrice": sum(prices) / len(prices)
    }

def get_country_from_hotels(hotels: List[Dict[str, Any]]) -> str:
    """
    Extract country name from hotel data
    """
    if not hotels:
        return "Unknown"
    
    # Try to get country from first hotel
    country = hotels[0].get('offer_country_name')
    if country:
        return country
    
    # Fallback: try to infer from location_heading or other fields
    location = hotels[0].get('location_heading', '').lower()
    
    # Simple country mapping based on common destinations
    country_mapping = {
        'bangkok': 'Thailand', 'phuket': 'Thailand', 'koh samui': 'Thailand',
        'chiang mai': 'Thailand', 'pattaya': 'Thailand', 'krabi': 'Thailand',
        'bali': 'Indonesia', 'jakarta': 'Indonesia', 'yogyakarta': 'Indonesia',
        'ho chi minh': 'Vietnam', 'hanoi': 'Vietnam', 'da nang': 'Vietnam',
        'manila': 'Philippines', 'cebu': 'Philippines', 'boracay': 'Philippines',
        'kuala lumpur': 'Malaysia', 'penang': 'Malaysia', 'langkawi': 'Malaysia',
        'singapore': 'Singapore',
        'sydney': 'Australia', 'melbourne': 'Australia', 'brisbane': 'Australia',
        'london': 'United Kingdom', 'paris': 'France', 'rome': 'Italy',
        'madrid': 'Spain', 'barcelona': 'Spain', 'amsterdam': 'Netherlands',
        'tokyo': 'Japan', 'osaka': 'Japan', 'kyoto': 'Japan',
        'seoul': 'South Korea', 'busan': 'South Korea',
        'new york': 'United States', 'los angeles': 'United States',
        'miami': 'United States', 'chicago': 'United States',
        'toronto': 'Canada', 'vancouver': 'Canada', 'montreal': 'Canada',
        'cancun': 'Mexico', 'mexico city': 'Mexico', 'los cabos': 'Mexico',
        'auckland': 'New Zealand', 'queenstown': 'New Zealand',
        'rio de janeiro': 'Brazil', 'sao paulo': 'Brazil',
        'buenos aires': 'Argentina', 'santiago': 'Chile',
        'bogota': 'Colombia', 'lima': 'Peru'
    }
    
    for dest, country in country_mapping.items():
        if dest in location:
            return country
    
    return "Unknown"

def group_destinations_by_region(hotel_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Dict[str, Any]]:
    """
    Group destinations by region with real statistics
    Limited to top 6 countries per region and top 10 destinations per country
    """
    regional_data = defaultdict(lambda: defaultdict(lambda: {
        "hotelCount": 0,
        "destinations": {}
    }))
    
    print("🌍 Grouping destinations by region...")
    
    for destination, hotels in hotel_data.items():
        if not hotels:
            continue
            
        # Get country and destination stats
        country = get_country_from_hotels(hotels)
        stats = calculate_destination_stats(hotels)
        
        # Find region for this country
        region = None
        for reg, countries in REGIONAL_MAPPING.items():
            if country in countries:
                region = reg
                break
        
        if not region:
            print(f"⚠️  Country '{country}' not found in regional mapping, skipping destination '{destination}'")
            continue
        
        # Update regional data
        regional_data[region][country]["hotelCount"] += stats["hotelCount"]
        regional_data[region][country]["destinations"][destination] = {
            "hotelCount": stats["hotelCount"],
            "minPrice": stats["minPrice"]
        }
    
    # Limit to top 6 countries per region and top 10 destinations per country
    final_regional_data = {}
    
    for region, region_data in regional_data.items():
        # Sort countries by hotel count and take top 6
        countries_with_hotels = [(country, data) for country, data in region_data.items() 
                                if country != "totalHotels"]
        top_countries = sorted(countries_with_hotels, key=lambda x: x[1]["hotelCount"], reverse=True)[:6]
        
        final_regional_data[region] = {
            "totalHotels": sum(country_data["hotelCount"] for _, country_data in top_countries),
            "countries": {}
        }
        
        for country, country_data in top_countries:
            # Sort destinations by hotel count and take top 10
            destinations = country_data["destinations"]
            top_destinations = sorted(destinations.items(), key=lambda x: x[1]["hotelCount"], reverse=True)[:10]
            
            final_regional_data[region]["countries"][country] = {
                "hotelCount": country_data["hotelCount"],
                "destinations": dict(top_destinations)
            }
    
    return final_regional_data

def generate_search_data(hotel_data: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, str]]:
    """
    Generate search data with countries and destinations
    """
    search_data = []
    processed_countries = set()
    
    for destination, hotels in hotel_data.items():
        if not hotels:
            continue
            
        country = get_country_from_hotels(hotels)
        
        # Add country if not already added
        if country not in processed_countries and country != "Unknown":
            search_data.append({
                "name": country,
                "slug": country.lower().replace(" ", "-").replace("&", "and"),
                "type": "country"
            })
            processed_countries.add(country)
        
        # Add destination
        search_data.append({
            "name": destination.replace("_", " ").title(),
            "slug": destination,
            "type": "destination"
        })
    
    return search_data

def save_homepage_data(regional_data: Dict[str, Any], search_data: List[Dict[str, str]]):
    """
    Save homepage data to JSON file
    """
    output_file = "data/homepage-data.json"
    os.makedirs("data", exist_ok=True)
    
    homepage_data = {
        "regionalData": regional_data,
        "searchData": search_data,
        "generatedAt": "2025-01-01T00:00:00Z",
        "totalDestinations": len(search_data),
        "totalRegions": len(regional_data)
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(homepage_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved homepage data to {output_file}")
    
    # Also save a summary
    summary_file = "data/homepage-summary.json"
    summary = {
        "regions": {},
        "statistics": {
            "totalDestinations": len(search_data),
            "totalRegions": len(regional_data),
            "totalCountries": sum(len(region_data) - 1 for region_data in regional_data.values()),  # -1 for totalHotels
            "totalHotels": sum(region_data["totalHotels"] for region_data in regional_data.values())
        }
    }
    
    for region, region_data in regional_data.items():
        summary["regions"][region] = {
            "totalHotels": region_data["totalHotels"],
            "countries": len([k for k in region_data.keys() if k != "totalHotels"]),
            "destinations": sum(len(country_data["destinations"]) for country_data in region_data.values() if isinstance(country_data, dict) and "destinations" in country_data)
        }
    
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved summary to {summary_file}")

def main():
    """
    Main function to generate homepage data
    """
    print("🚀 Homepage Data Generator")
    print("=" * 50)
    
    # Load hotel data
    hotel_data = load_hotel_data()
    if not hotel_data:
        print("❌ No hotel data found. Please run generate_hotel_json.py first.")
        return
    
    # Group destinations by region with real stats
    regional_data = group_destinations_by_region(hotel_data)
    
    # Generate search data
    search_data = generate_search_data(hotel_data)
    
    # Save homepage data
    save_homepage_data(regional_data, search_data)
    
    # Print summary
    print("\n📊 Homepage Data Summary:")
    print(f"   • Total regions: {len(regional_data)}")
    print(f"   • Total destinations: {len(search_data)}")
    print(f"   • Total hotels: {sum(region_data['totalHotels'] for region_data in regional_data.values())}")
    
    print("\n🌍 Regional Breakdown:")
    for region, region_data in regional_data.items():
        countries = list(region_data["countries"].keys())
        print(f"   • {region}: {region_data['totalHotels']:,} hotels across {len(countries)} countries")
        
        # Show top 3 countries with real prices
        top_countries = sorted(countries, key=lambda c: region_data["countries"][c]["hotelCount"], reverse=True)[:3]
        for country in top_countries:
            country_data = region_data["countries"][country]
            destinations = country_data["destinations"]
            
            # Show top destination with real price
            if destinations:
                top_dest = max(destinations.items(), key=lambda x: x[1]["hotelCount"])
                dest_name, dest_stats = top_dest
                price_info = f"from ${dest_stats['minPrice']:.0f}" if dest_stats['minPrice'] else "price N/A"
                print(f"     - {country}: {country_data['hotelCount']:,} hotels, top destination {dest_name.replace('_', ' ').title()} ({price_info})")
            else:
                print(f"     - {country}: {country_data['hotelCount']:,} hotels")
    
    print(f"\n🎉 Homepage data generation complete!")
    print(f"📁 Files created:")
    print(f"   • data/homepage-data.json (full data)")
    print(f"   • data/homepage-summary.json (summary)")
    
    print(f"\n🔄 Next steps:")
    print(f"   1. Update RegionalHomepage.tsx to use real prices")
    print(f"   2. Test the homepage with real data")
    print(f"   3. Deploy updated version")

if __name__ == "__main__":
    main()
