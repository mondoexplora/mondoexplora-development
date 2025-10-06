#!/usr/bin/env python3
"""
Test Ad Generator - Creates a single ad image for testing
Inspired by the reference image with vertical format for social stories
"""

import json
import requests
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import os
from datetime import datetime

def download_image(url, size=(1080, 1920)):
    """Download and resize image from URL"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Open image from bytes
        img = Image.open(BytesIO(response.content))
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to target size (maintain aspect ratio)
        img.thumbnail(size, Image.Resampling.LANCZOS)
        
        # Create new image with target size
        new_img = Image.new('RGB', size, (0, 0, 0))
        
        # Center the image
        x = (size[0] - img.width) // 2
        y = (size[1] - img.height) // 2
        new_img.paste(img, (x, y))
        
        return new_img
    except Exception as e:
        print(f"Error downloading image: {e}")
        # Return a gradient background if image fails
        return create_gradient_background(size)

def create_gradient_background(size):
    """Create a gradient background as fallback"""
    img = Image.new('RGB', size)
    draw = ImageDraw.Draw(img)
    
    # Create gradient from top to bottom
    for y in range(size[1]):
        # Blue to darker blue gradient
        r = int(25 + (y / size[1]) * 30)
        g = int(50 + (y / size[1]) * 40)
        b = int(100 + (y / size[1]) * 50)
        draw.line([(0, y), (size[0], y)], fill=(r, g, b))
    
    return img

def create_ad_image(hotel_data):
    """Create ad image with hotel data"""
    
    # Image dimensions for vertical social stories
    width, height = 1080, 1920
    
    # Download and prepare base image
    print(f"Downloading image for {hotel_data['vendor_name']}...")
    base_image = download_image(hotel_data['hero_image'], (width, height))
    
    # Create overlay for text readability
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw_overlay = ImageDraw.Draw(overlay)
    
    # Add gradient overlay (darker at bottom for text)
    for y in range(height):
        alpha = int(100 + (y / height) * 150)  # More transparent at top, darker at bottom
        draw_overlay.line([(0, y), (width, y)], fill=(0, 0, 0, alpha))
    
    # Combine base image with overlay
    result = Image.alpha_composite(base_image.convert('RGBA'), overlay).convert('RGB')
    draw = ImageDraw.Draw(result)
    
    # Try to load a nice font, fallback to default if not available
    try:
        # Try to use a system font
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
        price_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 96)
        badge_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
    except:
        # Fallback to default font
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        price_font = ImageFont.load_default()
        badge_font = ImageFont.load_default()
    
    # Calculate discount percentage
    original_price = float(hotel_data['value'])
    discounted_price = float(hotel_data['price'])
    discount_percent = int(((original_price - discounted_price) / original_price) * 100)
    
    # Add vendor name (top left, like the reference image)
    vendor_name = hotel_data['vendor_name']
    draw.text((60, 200), vendor_name, fill=(255, 255, 255), font=title_font)
    
    # Add location
    location = f"{hotel_data['location_heading']}, {hotel_data['location_subheading']}"
    draw.text((60, 300), location, fill=(200, 200, 200), font=subtitle_font)
    
    # Add price information (bottom left)
    price_text = f"${hotel_data['price']}"
    draw.text((60, height - 400), price_text, fill=(255, 255, 255), font=price_font)
    
    # Add original price (strikethrough)
    original_text = f"Valued up to ${hotel_data['value']}"
    draw.text((60, height - 300), original_text, fill=(180, 180, 180), font=subtitle_font)
    
    # Add discount badge (bottom right, like the green circle in reference)
    badge_size = 200
    badge_x = width - badge_size - 60
    badge_y = height - badge_size - 60
    
    # Draw circular badge
    draw.ellipse([badge_x, badge_y, badge_x + badge_size, badge_y + badge_size], 
                 fill=(255, 69, 0))  # Orange-red color
    
    # Add discount text to badge
    save_text = "SAVE"
    percent_text = f"{discount_percent}%"
    
    # Center text in badge
    save_bbox = draw.textbbox((0, 0), save_text, font=badge_font)
    save_width = save_bbox[2] - save_bbox[0]
    save_x = badge_x + (badge_size - save_width) // 2
    
    percent_bbox = draw.textbbox((0, 0), percent_text, font=price_font)
    percent_width = percent_bbox[2] - percent_bbox[0]
    percent_x = badge_x + (badge_size - percent_width) // 2
    
    draw.text((save_x, badge_y + 30), save_text, fill=(255, 255, 255), font=badge_font)
    draw.text((percent_x, badge_y + 70), percent_text, fill=(255, 255, 255), font=price_font)
    
    # Add urgency badge if needed (top right)
    # For now, we'll add a "Limited time offer" badge
    urgency_badge_x = width - 200 - 60
    urgency_badge_y = 60
    
    # Draw urgency badge background
    draw.rectangle([urgency_badge_x, urgency_badge_y, urgency_badge_x + 200, urgency_badge_y + 40], 
                   fill=(220, 53, 69))  # Red color
    
    # Add urgency text
    urgency_text = "Limited time offer"
    urgency_bbox = draw.textbbox((0, 0), urgency_text, font=badge_font)
    urgency_width = urgency_bbox[2] - urgency_bbox[0]
    urgency_x = urgency_badge_x + (200 - urgency_width) // 2
    
    draw.text((urgency_x, urgency_badge_y + 5), urgency_text, fill=(255, 255, 255), font=badge_font)
    
    return result

def main():
    """Main function to test ad generation"""
    
    # Test hotel data (Hotel Madero from Buenos Aires)
    test_hotel = {
        "vendor_name": "Hotel Madero",
        "title": "Luxury waterfront hotel in Puerto Madero",
        "description": "Experience luxury in the heart of Buenos Aires' most exclusive neighborhood.",
        "price": "189",
        "value": "320",
        "hero_image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "link": "https://luxuryescapes.com/us/hotels",
        "location_heading": "Puerto Madero",
        "location_subheading": "Buenos Aires, Argentina"
    }
    
    print("Creating test ad image...")
    
    # Create the ad image
    ad_image = create_ad_image(test_hotel)
    
    # Create output directory if it doesn't exist
    output_dir = "../output"
    os.makedirs(output_dir, exist_ok=True)
    
    # Save the image with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{output_dir}/test_ad_{timestamp}.jpg"
    
    ad_image.save(filename, "JPEG", quality=95)
    print(f"✅ Test ad image saved: {filename}")
    print(f"📱 Image size: {ad_image.size[0]}x{ad_image.size[1]} (vertical format)")
    print(f"🏨 Hotel: {test_hotel['vendor_name']}")
    print(f"💰 Price: ${test_hotel['price']} (was ${test_hotel['value']})")

if __name__ == "__main__":
    main() 