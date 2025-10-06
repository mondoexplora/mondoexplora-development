#!/usr/bin/env python3
"""
Script to generate placeholder images for countries and cities
"""

import os
from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO

def create_placeholder_image(text, filename, size=(800, 600), bg_color=(102, 126, 234)):
    """Create a placeholder image with text"""
    # Create image
    img = Image.new('RGB', size, bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fallback to default if not available
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 60)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position (center)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size[0] - text_width) // 2
    y = (size[1] - text_height) // 2
    
    # Draw text
    draw.text((x, y), text, fill=(255, 255, 255), font=font)
    
    # Save image
    img.save(filename)
    print(f"Created: {filename}")

def download_image(url, filename):
    """Download image from URL"""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            img = Image.open(BytesIO(response.content))
            img = img.resize((800, 600))
            img.save(filename)
            print(f"Downloaded: {filename}")
            return True
    except Exception as e:
        print(f"Failed to download {filename}: {e}")
    return False

def main():
    # Create directories if they don't exist
    os.makedirs('images/countries', exist_ok=True)
    os.makedirs('images/cities', exist_ok=True)
    
    # Thailand country image
    thailand_image = 'images/countries/thailand.jpg'
    if not os.path.exists(thailand_image):
        create_placeholder_image("THAILAND", thailand_image, (1200, 800), (102, 126, 234))
    
    # City images for Thailand
    cities = [
        'bangkok',
        'chiang_mai', 
        'phuket',
        'krabi',
        'koh_samui',
        'pattaya',
        'koh_tao',
        'koh_phi_phi'
    ]
    
    for city in cities:
        city_image = f'images/cities/{city}.jpg'
        if not os.path.exists(city_image):
            # Create placeholder with city name
            city_display = city.replace('_', ' ').title()
            create_placeholder_image(city_display, city_image, (600, 400), (118, 75, 162))
    
    print("✅ Placeholder images created successfully!")
    print("📁 Check the 'images/' directory for generated images")

if __name__ == "__main__":
    main() 