#!/usr/bin/env python3
"""
Instagram Story Ad Generator v3
Creates vertical social story ads with blurred hero background, white container, and refined hotel boxes
"""

import os
import json
import requests
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageFilter
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

def create_hotel_box(draw, x, y, width, height, hotel_data, font_medium, font_small):
    """Create a hotel box with image, price badge, and vendor name overlay"""
    # Download and add hotel image
    try:
        temp_img_path = f"temp_hotel_{hotel_data['vendor_name'].replace(' ', '_')}.jpg"
        if download_image(hotel_data['hero_image'], temp_img_path):
            hotel_img = Image.open(temp_img_path)
            hotel_img = hotel_img.resize((width, height), Image.Resampling.LANCZOS)
            
            # Create a new image for the hotel box
            box_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            box_img.paste(hotel_img, (0, 0))
            
            # Add dark overlay for vendor name area (bottom portion)
            overlay_height = int(height * 0.3)  # 30% of height for name overlay
            overlay_y = height - overlay_height
            
            # Create dark overlay for vendor name
            name_overlay = Image.new('RGBA', (width, overlay_height), (0, 0, 0, 150))
            box_img.paste(name_overlay, (0, overlay_y), name_overlay)
            
            # Add vendor name in white text
            box_draw = ImageDraw.Draw(box_img)
            vendor_name = hotel_data['vendor_name']
            if len(vendor_name) > 30:
                vendor_name = vendor_name[:27] + "..."
            
            # Center the vendor name
            text_bbox = box_draw.textbbox((0, 0), vendor_name, font=font_medium)
            text_width = text_bbox[2] - text_bbox[0]
            text_x = (width - text_width) // 2
            text_y = overlay_y + (overlay_height - (text_bbox[3] - text_bbox[1])) // 2
            
            box_draw.text((text_x, text_y), vendor_name, font=font_medium, fill=(255, 255, 255))
            
            # Add price badge in top-right corner
            price_text = f"${hotel_data['price']}"
            if hotel_data.get('value') and hotel_data['value'] > hotel_data['price']:
                original_price = f"${hotel_data['value']}"
                # Create price badge background
                badge_padding = 15
                badge_margin = 10
                
                # Calculate badge size
                original_bbox = box_draw.textbbox((0, 0), original_price, font=font_small)
                current_bbox = box_draw.textbbox((0, 0), price_text, font=font_medium)
                
                badge_width = max(original_bbox[2] - original_bbox[0], current_bbox[2] - current_bbox[0]) + badge_padding * 2
                badge_height = (original_bbox[3] - original_bbox[1]) + (current_bbox[3] - current_bbox[1]) + badge_padding * 2
                
                badge_x = width - badge_width - badge_margin
                badge_y = badge_margin
                
                # White badge background
                create_rounded_rectangle(box_draw, badge_x, badge_y, badge_x + badge_width, badge_y + badge_height, 8, (255, 255, 255))
                
                # Original price (strikethrough)
                original_x = badge_x + (badge_width - (original_bbox[2] - original_bbox[0])) // 2
                original_y = badge_y + 5
                box_draw.text((original_x, original_y), original_price, font=font_small, fill=(100, 100, 100))
                
                # Current price (green)
                current_x = badge_x + (badge_width - (current_bbox[2] - current_bbox[0])) // 2
                current_y = original_y + (original_bbox[3] - original_bbox[1]) + 2
                box_draw.text((current_x, current_y), price_text, font=font_medium, fill=(34, 197, 94))  # Green color
            
            os.remove(temp_img_path)
            return box_img
            
    except Exception as e:
        print(f"❌ Error creating hotel box: {e}")
        # Create fallback box
        box_img = Image.new('RGBA', (width, height), (200, 200, 200))
        box_draw = ImageDraw.Draw(box_img)
        box_draw.text((10, 10), f"Error loading {hotel_data['vendor_name']}", font=font_medium, fill=(0, 0, 0))
        return box_img

def main():
    print("Creating Instagram Story Ad v3...")
    
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
    
    # Select 3 hotels for the ad
    selected_hotels = hotels[:3]  # First 3 hotels
    
    # Create output directory
    output_dir = "../output"
    os.makedirs(output_dir, exist_ok=True)
    
    # Download hero image (destination page background)
    hero_url = "https://images.unsplash.com/photo-1468413253725-0d5181091126?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    hero_temp = "temp_hero.jpg"
    
    if not download_image(hero_url, hero_temp):
        print("❌ Failed to download hero image")
        return
    
    # Open and process hero image
    hero_img = Image.open(hero_temp)
    
    # Crop hero image to center for 1080x1920
    hero_width, hero_height = hero_img.size
    target_ratio = width / height
    
    if hero_width / hero_height > target_ratio:
        # Hero image is wider, crop width
        new_width = int(hero_height * target_ratio)
        left = (hero_width - new_width) // 2
        hero_img = hero_img.crop((left, 0, left + new_width, hero_height))
    else:
        # Hero image is taller, crop height
        new_height = int(hero_width / target_ratio)
        top = (hero_height - new_height) // 2
        hero_img = hero_img.crop((0, top, hero_width, top + new_height))
    
    # Resize to exact dimensions
    hero_img = hero_img.resize((width, height), Image.Resampling.LANCZOS)
    
    # Apply blur and darken
    hero_img = hero_img.filter(ImageFilter.GaussianBlur(radius=3))
    
    # Create the story image
    story_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    story_img.paste(hero_img, (0, 0))
    
    # Add dark overlay for better text readability
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 120))
    story_img = Image.alpha_composite(story_img, overlay)
    
    # Create drawing object
    draw = ImageDraw.Draw(story_img)
    
    # Load refined fonts (thinner, more elegant)
    try:
        # Try to use a more refined font
        font_bold = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
        font_medium = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
    except:
        # Fallback to default font
        font_bold = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Calculate layout dimensions
    top_margin = 60
    header_height = 80
    header_y = top_margin
    
    # Create header text
    location_text = f"{selected_hotels[0]['location_heading']} - {selected_hotels[0]['location_subheading']}"
    deals_text = "Hotel Deals"
    
    # Draw header text
    draw.text((40, header_y + 20), location_text, font=font_bold, fill=(255, 255, 255))
    
    # Right-align "Hotel Deals"
    deals_bbox = draw.textbbox((0, 0), deals_text, font=font_medium)
    deals_width = deals_bbox[2] - deals_bbox[0]
    deals_x = width - deals_width - 40
    draw.text((deals_x, header_y + 25), deals_text, font=font_medium, fill=(255, 255, 255))
    
    # Calculate white container dimensions
    container_margin = 40
    container_width = width - (container_margin * 2)
    container_height = height - header_y - header_height - container_margin
    container_x = container_margin
    container_y = header_y + header_height + 20
    
    # Create white container background
    create_rounded_rectangle(draw, container_x, container_y, container_x + container_width, container_y + container_height, 20, (255, 255, 255))
    
    # Calculate hotel box dimensions
    hotel_box_margin = 20
    hotel_box_width = container_width - (hotel_box_margin * 2)
    hotel_box_height = (container_height - (hotel_box_margin * 4)) // 3  # 3 hotels with spacing
    hotel_box_x = container_x + hotel_box_margin
    
    # Create hotel boxes
    for i, hotel in enumerate(selected_hotels):
        hotel_y = container_y + hotel_box_margin + (i * (hotel_box_height + hotel_box_margin))
        
        # Create hotel box
        hotel_box = create_hotel_box(
            draw, hotel_box_x, hotel_y, hotel_box_width, hotel_box_height,
            hotel, font_medium, font_small
        )
        
        # Composite hotel box onto story
        if hotel_box:
            story_img.paste(hotel_box, (hotel_box_x, hotel_y), hotel_box)
    
    # Save the final image
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{output_dir}/instagram_story_v3_{timestamp}.jpg"
    
    # Convert to RGB and save
    story_img_rgb = story_img.convert('RGB')
    story_img_rgb.save(filename, 'JPEG', quality=95)
    
    # Clean up temp files
    if os.path.exists(hero_temp):
        os.remove(hero_temp)
    
    print(f"✅ Instagram Story ad v3 saved: {filename}")
    print(f"📱 Image size: {width}x{height} (vertical format)")
    print(f"🏨 Hotels featured: {len(selected_hotels)}")
    for i, hotel in enumerate(selected_hotels, 1):
        print(f"   {i}. {hotel['vendor_name']} - ${hotel['price']}")

if __name__ == "__main__":
    main() 