#!/usr/bin/env python3
"""
Instagram Story Ad Generator v8
Version with bolder fonts and optimized image quality for smartphones
"""

import os
import json
import requests
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
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

def draw_bold_text(draw, x, y, text, font, fill, boldness=3):
    """Draw text with bold effect by drawing multiple times with offsets"""
    for offset_x in range(-boldness, boldness + 1):
        for offset_y in range(-boldness, boldness + 1):
            draw.text((x + offset_x, y + offset_y), text, font=font, fill=fill)
    
    # Draw the main text on top for crisp edges
    draw.text((x, y), text, font=font, fill=fill)

def create_hotel_box(draw, x, y, width, height, hotel_data, font_medium, font_small, font_large):
    """Create a hotel box with image, price badge, vendor name overlay, and thin white border"""
    # Download and add hotel image
    try:
        temp_img_path = f"temp_hotel_{hotel_data['vendor_name'].replace(' ', '_')}.jpg"
        if download_image(hotel_data['hero_image'], temp_img_path):
            hotel_img = Image.open(temp_img_path)
            
            # Enhanced image processing for better quality
            # Resize with high-quality resampling
            hotel_img = hotel_img.resize((width, height), Image.Resampling.LANCZOS)
            
            # Enhance sharpness slightly for better definition
            enhancer = ImageEnhance.Sharpness(hotel_img)
            hotel_img = enhancer.enhance(1.2)
            
            # Create a new image for the hotel box
            box_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            box_img.paste(hotel_img, (0, 0))
            
            # Add dark overlay for vendor name area (50% bigger = 22.5% of total height)
            overlay_height = int(height * 0.225)  # 22.5% of height for name overlay
            overlay_y = height - overlay_height
            
            # Create dark overlay for vendor name (darker)
            name_overlay = Image.new('RGBA', (width, overlay_height), (0, 0, 0, 200))
            box_img.paste(name_overlay, (0, overlay_y), name_overlay)
            
            # Add vendor name in white text (left-aligned with margin)
            box_draw = ImageDraw.Draw(box_img)
            vendor_name = hotel_data['vendor_name']
            if len(vendor_name) > 35:
                vendor_name = vendor_name[:32] + "..."
            
            # Left-align the vendor name with margin
            text_x = 15  # 15px margin from left
            text_y = overlay_y + (overlay_height - (font_medium.getbbox(vendor_name)[3] - font_medium.getbbox(vendor_name)[1])) // 2
            
            box_draw.text((text_x, text_y), vendor_name, font=font_medium, fill=(255, 255, 255))
            
            # Add price badge in lower-right corner of blurred section (30% smaller fonts)
            if hotel_data.get('value') and hotel_data['value'] > hotel_data['price']:
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
                            print(f"✅ Using bold font for prices: {font_path}")
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

def main():
    print("Creating Instagram Story Ad v8 (Bold Fonts + HD Quality)...")
    
    # Story dimensions (Instagram Story) - Optimized for smartphone displays
    # Using 2x resolution for retina displays while keeping file size reasonable
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
    
    # Download hero image (destination page background) - Higher quality URL
    hero_url = "https://images.unsplash.com/photo-1468413253725-0d5181091126?q=95&w=2160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
    
    # Resize to exact dimensions with high-quality resampling
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
    
    # Load fonts with BOLDER options for headers
    try:
        # Try multiple paths for BOLD fonts
        bold_font_paths = [
            "/System/Library/Fonts/HelveticaNeue-Bold.ttf",
            "/System/Library/Fonts/HelveticaNeue.ttc",
            "/System/Library/Fonts/Arial-Bold.ttf",
            "/System/Library/Fonts/Arial.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "/System/Library/Fonts/Outfit-Bold.ttf",
            "/System/Library/Fonts/Outfit-Medium.ttf"
        ]
        
        header_font = None
        for path in bold_font_paths:
            try:
                # Try to load with bold weight if possible
                if "Bold" in path or "Neue" in path:
                    header_font = ImageFont.truetype(path, 54)
                    print(f"✅ Loaded BOLD header font from: {path}")
                    break
                else:
                    # For regular fonts, we'll make them bold manually
                    header_font = ImageFont.truetype(path, 54)
                    print(f"✅ Loaded header font from: {path} (will make bold)")
                    break
            except:
                continue
        
        if not header_font:
            # Fallback to default with manual bold effect
            header_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 54)
            print("⚠️ Using Helvetica with manual bold effect")
        
        # Vendor name font
        font_medium = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 31)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
    except Exception as e:
        print(f"⚠️ Font loading error: {e}")
        # Fallback to default font
        header_font = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Calculate layout dimensions with 10% top space and 15% bottom space
    top_space = int(height * 0.10)  # 10% for Instagram account
    bottom_space = int(height * 0.15)  # 15% bottom space
    available_height = height - top_space - bottom_space
    
    header_height = 100
    header_y = top_space + 20
    
    # Create header text with BOLD effect
    location_text = f"{selected_hotels[0]['location_heading']} - {selected_hotels[0]['location_subheading']}"
    deals_text = "Hotel Deals"
    
    # Draw header text with BOLD effect (multiple passes for thickness)
    draw_bold_text(draw, 40, header_y + 20, location_text, header_font, (255, 255, 255), boldness=2)
    
    # Right-align "Hotel Deals" with BOLD effect
    deals_bbox = draw.textbbox((0, 0), deals_text, font=header_font)
    deals_width = deals_bbox[2] - deals_bbox[0]
    deals_x = width - deals_width - 40
    draw_bold_text(draw, deals_x, header_y + 20, deals_text, header_font, (255, 255, 255), boldness=2)
    
    # Calculate hotel box dimensions (no white container, floating on hero background)
    hotel_box_margin = 30  # Spacing between boxes
    hotel_box_width = width - 80  # Leave 40px margin on each side
    hotel_box_height = (available_height - header_height - (hotel_box_margin * 2)) // 3  # 3 hotels with spacing
    hotel_box_x = 40  # 40px margin from left
    
    # Create hotel boxes
    for i, hotel in enumerate(selected_hotels):
        hotel_y = header_y + header_height + 20 + (i * (hotel_box_height + hotel_box_margin))
        
        # Create hotel box
        hotel_box = create_hotel_box(
            draw, hotel_box_x, hotel_y, hotel_box_width, hotel_box_height,
            hotel, font_medium, font_small, header_font
        )
        
        # Composite hotel box onto story
        if hotel_box:
            story_img.paste(hotel_box, (hotel_box_x, hotel_y), hotel_box)
    
    # Save the final image with optimized quality settings
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{output_dir}/instagram_story_v8_{timestamp}.jpg"
    
    # Convert to RGB and save with optimized settings for smartphone displays
    story_img_rgb = story_img.convert('RGB')
    
    # Quality settings optimized for smartphone displays:
    # - 90% JPEG quality: Good balance between file size and visual quality
    # - Progressive JPEG: Better loading experience on mobile
    # - Optimize=True: Reduces file size without quality loss
    story_img_rgb.save(filename, 'JPEG', quality=90, optimize=True, progressive=True)
    
    # Get file size for reference
    file_size = os.path.getsize(filename)
    file_size_mb = file_size / (1024 * 1024)
    
    # Clean up temp files
    if os.path.exists(hero_temp):
        os.remove(hero_temp)
    
    print(f"✅ Instagram Story ad v8 saved: {filename}")
    print(f"📱 Image size: {width}x{height} (vertical format)")
    print(f"💾 File size: {file_size_mb:.2f} MB")
    print(f"🎨 Quality: 90% JPEG (optimized for smartphones)")
    print(f"🏨 Hotels featured: {len(selected_hotels)}")
    for i, hotel in enumerate(selected_hotels, 1):
        print(f"   {i}. {hotel['vendor_name']} - ${hotel['price']}")

if __name__ == "__main__":
    main() 