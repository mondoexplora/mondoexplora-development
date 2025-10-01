#!/usr/bin/env python3
"""
Fast Instagram Story Ad Generator
Optimized for speed with parallel processing and specific location targeting
"""

import os
import json
import requests
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import math
import concurrent.futures
import time

# Configuration - Edit these for your needs
TARGET_LOCATIONS = [
    "phuket",
    "bangkok", 
    "bali",
    "sydney",
    "melbourne",
    "gold_coast",
    "cairns",
    "singapore",
    "tokyo",
    "kyoto",
    "osaka",
    "london",
    "paris",
    "rome",
    "barcelona",
    "madrid",
    "amsterdam",
    "berlin",
    "munich",
    "vienna",
    "prague",
    "budapest",
    "dubai",
    "abu_dhabi",
    "maldives",
    "mauritius",
    "seychelles",
    "fiji",
    "bora_bora",
    "tahiti"
]

# Performance settings
MAX_WORKERS = 4  # Number of parallel processes
TIMEOUT = 15  # Seconds timeout for image downloads
SKIP_EXISTING = True  # Skip if file already exists

def validate_hotel_data(hotel):
    """Validate that hotel has all required data"""
    required_fields = ['hero_image', 'vendor_name', 'price', 'value']
    
    for field in required_fields:
        if not hotel.get(field):
            return False, f"Missing {field}"
    
    # Check if image URL is valid
    if not hotel['hero_image'].startswith('http'):
        return False, "Invalid image URL"
    
    # Check if prices are valid numbers
    try:
        price = float(hotel['price'])
        value = float(hotel['value'])
        if price <= 0 or value <= 0:
            return False, "Invalid prices"
        if value <= price:
            return False, "Original price must be higher than current price"
    except (ValueError, TypeError):
        return False, "Invalid price format"
    
    return True, "Valid"

def filter_valid_hotels(hotels):
    """Filter hotels to ensure unique vendors and valid data"""
    valid_hotels = []
    seen_vendors = set()
    
    for hotel in hotels:
        # Validate hotel data
        is_valid, reason = validate_hotel_data(hotel)
        if not is_valid:
            print(f"⚠️ Skipping hotel: {hotel.get('vendor_name', 'Unknown')} - {reason}")
            continue
        
        # Check for duplicate vendor names
        vendor_name = hotel['vendor_name'].strip()
        if vendor_name in seen_vendors:
            print(f"⚠️ Skipping duplicate vendor: {vendor_name}")
            continue
        
        seen_vendors.add(vendor_name)
        valid_hotels.append(hotel)
    
    return valid_hotels

def download_image_fast(url, filename):
    """Fast image download with timeout"""
    try:
        response = requests.get(url, timeout=TIMEOUT, stream=True)
        response.raise_for_status()
        
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return False

def create_rounded_rectangle(draw, x1, y1, x2, y2, radius, fill):
    """Draw a rounded rectangle"""
    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill)
    draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill)
    draw.pieslice([x1, y1, x1 + 2*radius, y1 + 2*radius], 180, 270, fill=fill)
    draw.pieslice([x2 - 2*radius, y1, x2, y1 + 2*radius], 270, 360, fill=fill)
    draw.pieslice([x1, y2 - 2*radius, x1 + 2*radius, y2], 90, 180, fill=fill)
    draw.pieslice([x2 - 2*radius, y2 - 2*radius, x2, y2], 0, 90, fill=fill)

def draw_bold_text(draw, x, y, text, font, fill, boldness=2):
    """Draw text with bold effect"""
    for offset_x in range(-boldness, boldness + 1):
        for offset_y in range(-boldness, boldness + 1):
            draw.text((x + offset_x, y + offset_y), text, font=font, fill=fill)
    draw.text((x, y), text, font=font, fill=fill)

def create_hotel_box_fast(draw, x, y, width, height, hotel_data, font_medium, font_small, font_large):
    """Fast hotel box creation with error handling"""
    try:
        temp_img_path = f"temp_hotel_{hotel_data['vendor_name'].replace(' ', '_').replace('/', '_')[:20]}.jpg"
        
        if download_image_fast(hotel_data['hero_image'], temp_img_path):
            hotel_img = Image.open(temp_img_path)
            
            # Convert to RGB if needed (fixes palette image error)
            if hotel_img.mode in ('P', 'RGBA'):
                hotel_img = hotel_img.convert('RGB')
            
            # Fast resize
            hotel_img = hotel_img.resize((width, height), Image.Resampling.LANCZOS)
            
            # Create box image
            box_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            box_img.paste(hotel_img, (0, 0))
            
            # Add overlay
            overlay_height = int(height * 0.225)
            overlay_y = height - overlay_height
            name_overlay = Image.new('RGBA', (width, overlay_height), (0, 0, 0, 200))
            box_img.paste(name_overlay, (0, overlay_y), name_overlay)
            
            # Add vendor name
            box_draw = ImageDraw.Draw(box_img)
            vendor_name = hotel_data['vendor_name'][:35] + "..." if len(hotel_data['vendor_name']) > 35 else hotel_data['vendor_name']
            
            text_x = 15
            text_y = overlay_y + (overlay_height - (font_medium.getbbox(vendor_name)[3] - font_medium.getbbox(vendor_name)[1])) // 2
            
            box_draw.text((text_x, text_y), vendor_name, font=font_medium, fill=(255, 255, 255))
            
            # Add price badge (now guaranteed to exist due to validation)
            original_price = f"${hotel_data['value']}"
            current_price = f"${hotel_data['price']}"
            
            # Use modern fonts for prices (larger size for bolder appearance)
            price_font_size = int(font_large.size * 0.8)  # Larger for bolder look
            try:
                # Try bold/heavy modern fonts for prices
                bold_fonts = [
                    "/System/Library/Fonts/ArialHB.ttc",
                    "/System/Library/Fonts/Avenir.ttc",
                    "/System/Library/Fonts/HelveticaNeue.ttc",
                    "/System/Library/Fonts/Helvetica.ttc"
                ]
                
                price_font = None
                for font_path in bold_fonts:
                    try:
                        price_font = ImageFont.truetype(font_path, price_font_size)
                        break
                    except:
                        continue
                
                if not price_font:
                    price_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", price_font_size)
            except:
                price_font = font_medium  # Fallback
            
            # Calculate badge size for side-by-side layout
            original_bbox = price_font.getbbox(original_price)
            current_bbox = price_font.getbbox(current_price)
            
            original_width = original_bbox[2] - original_bbox[0]
            current_width = current_bbox[2] - current_bbox[0]
            
            # Badge dimensions (smaller padding for smaller fonts)
            badge_padding = 12
            badge_margin = 10
            badge_width = original_width + current_width + badge_padding * 3  # Space between prices
            badge_height = max(original_bbox[3] - original_bbox[1], current_bbox[3] - current_bbox[1]) + badge_padding * 2
            
            # Position in lower-right corner of blurred section
            badge_x = width - badge_width - badge_margin
            badge_y = overlay_y + (overlay_height - badge_height) - badge_margin
            
            # White badge background
            create_rounded_rectangle(box_draw, badge_x, badge_y, badge_x + badge_width, badge_y + badge_height, 8, (255, 255, 255))
            
            # Original price (strikethrough)
            original_x = badge_x + badge_padding
            original_y = badge_y + (badge_height - (original_bbox[3] - original_bbox[1])) // 2
            
            # Draw text first
            box_draw.text((original_x, original_y), original_price, font=price_font, fill=(100, 100, 100))
            # Draw strikethrough line
            text_bbox = price_font.getbbox(original_price)
            text_width = text_bbox[2] - text_bbox[0]
            line_y = original_y + (text_bbox[3] - text_bbox[1]) // 2
            box_draw.line([(original_x, line_y), (original_x + text_width, line_y)], fill=(100, 100, 100), width=2)
            
            # Current price (green, extra bold effect)
            current_x = original_x + original_width + badge_padding
            current_y = badge_y + (badge_height - (current_bbox[3] - current_bbox[1])) // 2
            
            # Draw text multiple times with slight offsets for bold effect
            for offset_x in range(-1, 2):
                for offset_y in range(-1, 2):
                    box_draw.text((current_x + offset_x, current_y + offset_y), current_price, font=price_font, fill=(34, 197, 94))
            
            # Draw the main text on top
            box_draw.text((current_x, current_y), current_price, font=price_font, fill=(34, 197, 94))  # Green color
            
            # Add thin white border around the hotel box
            border_color = (255, 255, 255)  # White border
            border_width = 2
            
            # Draw border (simple rectangle for now)
            box_draw.rectangle([0, 0, width-1, height-1], outline=border_color, width=border_width)
            
            os.remove(temp_img_path)
            return box_img
            
    except Exception as e:
        print(f"❌ Error creating hotel box: {e}")
        # Create fallback box
        box_img = Image.new('RGBA', (width, height), (200, 200, 200))
        box_draw = ImageDraw.Draw(box_img)
        box_draw.text((10, 10), f"Error loading {hotel_data['vendor_name']}", font=font_medium, fill=(0, 0, 0))
        return box_img

def generate_ad_fast(location_name):
    """Generate a single ad quickly"""
    try:
        # Check if file already exists
        timestamp = datetime.now().strftime("%Y%m%d")
        safe_location = location_name.replace(' ', '_').replace('/', '_').replace('&', 'and')
        
        # Load hotel data
        hotel_file = f"../../../data/hotels/{location_name}.json"
        if not os.path.exists(hotel_file):
            print(f"❌ File not found: {hotel_file}")
            return False
            
        with open(hotel_file, 'r', encoding='utf-8') as f:
            hotels = json.load(f)
        
        # Filter and validate hotels
        valid_hotels = filter_valid_hotels(hotels)
        
        if len(valid_hotels) < 3:
            print(f"⚠️ Insufficient valid hotels for {location_name} ({len(valid_hotels)} < 3)")
            print(f"   Original: {len(hotels)} hotels, Valid: {len(valid_hotels)} hotels")
            return False
        
        # Get country and location info
        country_name = valid_hotels[0].get('offer_country_name', 'Unknown')
        location_heading = valid_hotels[0].get('location_heading', location_name)
        
        # Create output directory
        country_folder = f"../output/{country_name}"
        os.makedirs(country_folder, exist_ok=True)
        
        filename = f"{timestamp}_{country_name}_{safe_location}.jpg"
        filepath = os.path.join(country_folder, filename)
        
        if SKIP_EXISTING and os.path.exists(filepath):
            print(f"⏭️ Skipping existing: {filename}")
            return True
        
        print(f"🎨 Generating: {location_heading}, {country_name} ({len(valid_hotels)} valid hotels)")
        
        # Story dimensions
        width, height = 1080, 1920
        selected_hotels = valid_hotels[:3]
        
        # Download hero image
        hero_url = "https://images.unsplash.com/photo-1468413253725-0d5181091126?q=95&w=2160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        hero_temp = f"temp_hero_{location_name}.jpg"
        
        if not download_image_fast(hero_url, hero_temp):
            return False
        
        # Process hero image
        hero_img = Image.open(hero_temp)
        if hero_img.mode in ('P', 'RGBA'):
            hero_img = hero_img.convert('RGB')
        
        # Crop and resize
        hero_width, hero_height = hero_img.size
        target_ratio = width / height
        
        if hero_width / hero_height > target_ratio:
            new_width = int(hero_height * target_ratio)
            left = (hero_width - new_width) // 2
            hero_img = hero_img.crop((left, 0, left + new_width, hero_height))
        else:
            new_height = int(hero_width / target_ratio)
            top = (hero_height - new_height) // 2
            hero_img = hero_img.crop((0, top, hero_width, top + new_height))
        
        hero_img = hero_img.resize((width, height), Image.Resampling.LANCZOS)
        hero_img = hero_img.filter(ImageFilter.GaussianBlur(radius=3))
        
        # Create story image
        story_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        story_img.paste(hero_img, (0, 0))
        
        # Add overlay
        overlay = Image.new('RGBA', (width, height), (0, 0, 0, 120))
        story_img = Image.alpha_composite(story_img, overlay)
        
        # Load fonts (simplified for speed)
        try:
            header_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 54)
            font_medium = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 31)
            font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
        except:
            header_font = ImageFont.load_default()
            font_medium = ImageFont.load_default()
            font_small = ImageFont.load_default()
        
        # Layout
        draw = ImageDraw.Draw(story_img)
        top_space = int(height * 0.10)
        bottom_space = int(height * 0.15)
        available_height = height - top_space - bottom_space
        header_height = 100
        header_y = top_space + 20
        
        # Header text
        location_text = f"{location_heading} - {country_name}"
        deals_text = "Hotel Deals"
        
        draw_bold_text(draw, 40, header_y + 20, location_text, header_font, (255, 255, 255), boldness=2)
        
        deals_bbox = draw.textbbox((0, 0), deals_text, font=header_font)
        deals_width = deals_bbox[2] - deals_bbox[0]
        deals_x = width - deals_width - 40
        draw_bold_text(draw, deals_x, header_y + 20, deals_text, header_font, (255, 255, 255), boldness=2)
        
        # Hotel boxes
        hotel_box_margin = 30
        hotel_box_width = width - 80
        hotel_box_height = (available_height - header_height - (hotel_box_margin * 2)) // 3
        hotel_box_x = 40
        
        for i, hotel in enumerate(selected_hotels):
            hotel_y = header_y + header_height + 20 + (i * (hotel_box_height + hotel_box_margin))
            
            hotel_box = create_hotel_box_fast(
                draw, hotel_box_x, hotel_y, hotel_box_width, hotel_box_height,
                hotel, font_medium, font_small, header_font
            )
            
            if hotel_box:
                story_img.paste(hotel_box, (hotel_box_x, hotel_y), hotel_box)
        
        # Save
        story_img_rgb = story_img.convert('RGB')
        story_img_rgb.save(filepath, 'JPEG', quality=90, optimize=True, progressive=True)
        
        # Cleanup
        if os.path.exists(hero_temp):
            os.remove(hero_temp)
        
        file_size = os.path.getsize(filepath) / (1024 * 1024)
        print(f"✅ Saved: {filename} ({file_size:.2f} MB)")
        return True
        
    except Exception as e:
        print(f"❌ Error generating {location_name}: {e}")
        return False

def main():
    print("🚀 Fast Instagram Story Ad Generator (with validation)")
    print(f"📋 Target locations: {len(TARGET_LOCATIONS)}")
    print(f"⚡ Max workers: {MAX_WORKERS}")
    print(f"⏱️ Timeout: {TIMEOUT}s")
    print(f"⏭️ Skip existing: {SKIP_EXISTING}")
    print(f"🔍 Validation: No duplicates, all data required")
    
    start_time = time.time()
    
    # Create output directory
    os.makedirs("../output", exist_ok=True)
    
    # Process locations
    successful = 0
    failed = 0
    
    if MAX_WORKERS > 1:
        # Parallel processing
        print(f"\n🔄 Processing {len(TARGET_LOCATIONS)} locations in parallel...")
        with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_location = {executor.submit(generate_ad_fast, loc): loc for loc in TARGET_LOCATIONS}
            
            for future in concurrent.futures.as_completed(future_to_location):
                location = future_to_location[future]
                try:
                    result = future.result()
                    if result:
                        successful += 1
                    else:
                        failed += 1
                except Exception as e:
                    print(f"❌ {location}: {e}")
                    failed += 1
    else:
        # Sequential processing
        print(f"\n🔄 Processing {len(TARGET_LOCATIONS)} locations sequentially...")
        for location in TARGET_LOCATIONS:
            if generate_ad_fast(location):
                successful += 1
            else:
                failed += 1
    
    # Summary
    elapsed_time = time.time() - start_time
    print(f"\n🎉 Generation Complete!")
    print(f"📊 Results:")
    print(f"   • Successful: {successful}")
    print(f"   • Failed: {failed}")
    print(f"   • Total time: {elapsed_time:.1f}s")
    print(f"   • Average per ad: {elapsed_time/len(TARGET_LOCATIONS):.1f}s")
    
    # Show output structure
    print(f"\n📁 Output structure:")
    import glob
    for country_folder in sorted(glob.glob("../output/*")):
        if os.path.isdir(country_folder):
            country_name = os.path.basename(country_folder)
            ad_count = len(glob.glob(f"{country_folder}/*.jpg"))
            print(f"   • {country_name}/ ({ad_count} ads)")

if __name__ == "__main__":
    main() 