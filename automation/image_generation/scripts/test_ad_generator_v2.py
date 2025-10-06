#!/usr/bin/env python3
"""
Instagram Story Ad Generator v2
Creates vertical social story ads with hero background, marketing tab, and hotel boxes
"""

import os
import json
import requests
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import math

def download_image(url, filename):
    """Download image from URL and save to file"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        with open(filename, 'wb') as f:
            f.write(response.content)
        return True
    except Exception as e:
        print(f"❌ Error downloading image: {e}")
        return False

def create_rounded_rectangle(draw, x1, y1, x2, y2, radius, fill):
    """Draw a rounded rectangle"""
    # Draw the main rectangle
    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill)
    draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill)
    
    # Draw the corners
    draw.pieslice([x1, y1, x1 + 2*radius, y1 + 2*radius], 180, 270, fill=fill)
    draw.pieslice([x2 - 2*radius, y1, x2, y1 + 2*radius], 270, 360, fill=fill)
    draw.pieslice([x1, y2 - 2*radius, x1 + 2*radius, y2], 90, 180, fill=fill)
    draw.pieslice([x2 - 2*radius, y2 - 2*radius, x2, y2], 0, 90, fill=fill)

def create_hotel_box(draw, x, y, width, height, hotel_data, font_large, font_medium, font_small):
    """Create a hotel box similar to destination page style"""
    # Hotel box background (white with slight transparency)
    box_bg = Image.new('RGBA', (width, height), (255, 255, 255, 230))
    
    # Create a new image to composite the box
    box_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    box_draw = ImageDraw.Draw(box_img)
    
    # Download and add hotel image (left side)
    img_width = int(width * 0.4)  # 40% of box width for image
    img_height = height
    
    # Create placeholder for hotel image (gray rectangle)
    box_draw.rectangle([0, 0, img_width, img_height], fill=(200, 200, 200))
    
    # Try to download actual hotel image
    try:
        temp_img_path = f"temp_hotel_{hotel_data['vendor_name'].replace(' ', '_')}.jpg"
        if download_image(hotel_data['hero_image'], temp_img_path):
            hotel_img = Image.open(temp_img_path)
            hotel_img = hotel_img.resize((img_width, img_height), Image.Resampling.LANCZOS)
            box_img.paste(hotel_img, (0, 0))
            os.remove(temp_img_path)
    except:
        pass  # Keep gray placeholder if image fails
    
    # Text content area (right side)
    text_x = img_width + 10
    text_width = width - img_width - 20
    
    # Hotel name
    hotel_name = hotel_data['vendor_name']
    if len(hotel_name) > 25:
        hotel_name = hotel_name[:22] + "..."
    box_draw.text((text_x, 10), hotel_name, font=font_medium, fill=(0, 0, 0))
    
    # Location
    location = hotel_data['location_heading']
    box_draw.text((text_x, 40), location, font=font_small, fill=(100, 100, 100))
    
    # Price
    price_text = f"${hotel_data['price']}"
    if hotel_data.get('value') and hotel_data['value'] > hotel_data['price']:
        original_price = f"${hotel_data['value']}"
        # Draw original price (strikethrough)
        box_draw.text((text_x, 70), original_price, font=font_small, fill=(150, 150, 150))
        # Draw current price
        box_draw.text((text_x + 60, 70), price_text, font=font_medium, fill=(0, 0, 0))
    else:
        box_draw.text((text_x, 70), price_text, font=font_medium, fill=(0, 0, 0))
    
    # Discount badge if applicable
    if hotel_data.get('percentage_discount'):
        discount_text = f"SAVE {int(hotel_data['percentage_discount'])}%"
        badge_width = box_draw.textlength(discount_text, font=font_small) + 20
        badge_x = text_x + text_width - badge_width - 10
        badge_y = height - 30
        
        # Red discount badge
        create_rounded_rectangle(box_draw, badge_x, badge_y, badge_x + badge_width, badge_y + 20, 10, (220, 53, 69))
        box_draw.text((badge_x + 10, badge_y + 2), discount_text, font=font_small, fill=(255, 255, 255))
    
    return box_img

def main():
    print("Creating Instagram Story Ad v2...")
    
    # Story dimensions (Instagram Story)
    width, height = 1080, 1920
    
    # Load Phuket hotels data
    try:
        with open('../../../data/hotels/phuket.json', 'r') as f:
            hotels = json.load(f)
        print(f"✅ Loaded {len(hotels)} hotels from Phuket data")
    except Exception as e:
        print(f"❌ Error loading hotel data: {e}")
        return
    
    # Select 2 hotels for the ad
    selected_hotels = hotels[:2]  # First 2 hotels
    
    # Create output directory
    output_dir = "../output"
    os.makedirs(output_dir, exist_ok=True)
    
    # Download hero image (destination page background)
    hero_url = "https://images.unsplash.com/photo-1468413253725-0d5181091126?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    hero_temp = "temp_hero.jpg"
    
    if not download_image(hero_url, hero_temp):
        print("❌ Failed to download hero image")
        return
    
    # Open and resize hero image to fill entire story
    hero_img = Image.open(hero_temp)
    hero_img = hero_img.resize((width, height), Image.Resampling.LANCZOS)
    
    # Create the story image
    story_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    story_img.paste(hero_img, (0, 0))
    
    # Add dark overlay for better text readability
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 100))
    story_img = Image.alpha_composite(story_img, overlay)
    
    # Create drawing object
    draw = ImageDraw.Draw(story_img)
    
    # Load fonts (using default fonts)
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
        font_medium = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except:
        # Fallback to default font
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Calculate layout dimensions
    top_space = int(height * 0.10)  # 10% for Instagram account
    tab_height = int(height * 0.07)  # 7% for marketing tab
    tab_y = top_space + 20
    
    # Create marketing tab with rounded ends
    tab_text = f"Thailand, Phuket - Deals of the Week"
    tab_text_width = draw.textlength(tab_text, font=font_medium)
    tab_width = tab_text_width + 60  # Add padding
    tab_x = (width - tab_width) // 2
    
    # White background tab with rounded ends
    create_rounded_rectangle(draw, tab_x, tab_y, tab_x + tab_width, tab_y + tab_height, 25, (255, 255, 255))
    draw.text((tab_x + 30, tab_y + 10), tab_text, font=font_medium, fill=(0, 0, 0))
    
    # Calculate hotel boxes area
    hotel_area_start = tab_y + tab_height + 40
    hotel_area_height = height - hotel_area_start - 40
    hotel_box_height = hotel_area_height // 2 - 20  # Half height minus spacing
    hotel_box_width = int(width * 0.85)  # 85% of story width
    hotel_box_x = (width - hotel_box_width) // 2
    
    # Create hotel boxes
    for i, hotel in enumerate(selected_hotels):
        hotel_y = hotel_area_start + (i * (hotel_box_height + 20))
        
        # Create hotel box
        hotel_box = create_hotel_box(
            draw, hotel_box_x, hotel_y, hotel_box_width, hotel_box_height,
            hotel, font_large, font_medium, font_small
        )
        
        # Composite hotel box onto story
        story_img.paste(hotel_box, (hotel_box_x, hotel_y), hotel_box)
    
    # Save the final image
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{output_dir}/instagram_story_{timestamp}.jpg"
    
    # Convert to RGB and save
    story_img_rgb = story_img.convert('RGB')
    story_img_rgb.save(filename, 'JPEG', quality=95)
    
    # Clean up temp files
    if os.path.exists(hero_temp):
        os.remove(hero_temp)
    
    print(f"✅ Instagram Story ad saved: {filename}")
    print(f"📱 Image size: {width}x{height} (vertical format)")
    print(f"🏨 Hotels featured: {len(selected_hotels)}")
    for i, hotel in enumerate(selected_hotels, 1):
        print(f"   {i}. {hotel['vendor_name']} - ${hotel['price']}")

if __name__ == "__main__":
    main() 