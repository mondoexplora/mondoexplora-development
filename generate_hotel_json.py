import csv
import json
import os

# Define the minimum required fields
required_fields = ["vendor_name", "hero_image", "link", "location_heading", "value", "title"]

# Define all fields to include in the output
all_fields = [
    "link", "hero_image", "image_two", "image_three", "vendor_name", "title",
    "description", "offer_country_name", "offer_country_code_alpha_2",
    "offer_geo_area_level_1", "offer_geo_area_level_2", "location_heading",
    "location_subheading", "location_description", "offer_address",
    "percentage_discount", "min_duration", "max_duration", "price", "value"
]

# Function to check if a row has all required fields
def has_required_fields(row, fields):
    return all(field in row and row[field] != "" for field in fields)

# Read CSV and process data
with open("PHqJwXEBeW6HKOyio7bi0A== (1).csv", newline="", encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)
    hotels = []
    for row in reader:
        # Convert numeric fields to appropriate types, handle empty strings
        try:
            row["value"] = float(row["value"]) if row["value"] else None
            row["price"] = float(row["price"]) if row["price"] else None
            row["percentage_discount"] = float(row["percentage_discount"]) if row["percentage_discount"] else None
            row["min_duration"] = int(row["min_duration"]) if row["min_duration"] else None
            row["max_duration"] = int(row["max_duration"]) if row["max_duration"] else None
        except (ValueError, KeyError):
            continue  # Skip row if conversion fails

        # Filter rows with required fields
        if has_required_fields(row, required_fields):
            hotel_data = {field: row.get(field) for field in all_fields}
            hotels.append(hotel_data)

# Group by offer_country_code_alpha_2 and location_heading and save to separate JSON files
grouped_hotels = {}
for hotel in hotels:
    key = f"{hotel['location_heading'].lower().replace(' ', '_')}"
    if key not in grouped_hotels:
        grouped_hotels[key] = []
    grouped_hotels[key].append(hotel)

# Ensure output directory exists for each file
os.makedirs("data/hotels", exist_ok=True)  # Ensure top-level directory exists
for key, hotel_list in grouped_hotels.items():
    filename = os.path.join("data/hotels", f"{key}.json")
    os.makedirs(os.path.dirname(filename), exist_ok=True)  # Create nested directories if needed
    with open(filename, "w", encoding="utf-8") as jsonfile:
        json.dump(hotel_list, jsonfile, ensure_ascii=False, indent=2)

# Log the result
output_dir = os.path.abspath("data/hotels")
file_count = len(grouped_hotels)
print(f"Script ran OK, generated {file_count} files in {output_dir}")