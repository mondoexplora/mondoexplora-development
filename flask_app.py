#!/usr/bin/env python3
"""
Flask Development Server for MondoExplora
Includes blog functionality for local development
"""

from flask import Flask, render_template, send_from_directory
from flask_sqlalchemy import SQLAlchemy
import os
import json
from config import config

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config.from_object(config['development'])

# Initialize database (use single instance)
from blog.models import db
db.init_app(app)

# Import blog routes first
from blog import routes

# Register blog blueprint
from blog import blog_bp
app.register_blueprint(blog_bp, url_prefix='/blog')

# Import creator routes first
from creator import routes as creator_routes

# Register creator blueprint
from creator import creator_bp
app.register_blueprint(creator_bp)

# Create database tables
with app.app_context():
    db.create_all()

# Static file routes
@app.route('/css/<path:filename>')
def css(filename):
    return send_from_directory('css', filename)

@app.route('/images/<path:filename>')
def images(filename):
    return send_from_directory('images', filename)

@app.route('/js/<path:filename>')
def js(filename):
    return send_from_directory('js', filename)

# Main routes
@app.route('/')
def home():
    """Homepage"""
    return render_template('index.html')

@app.route('/destination/<destination>')
def destination(destination):
    """Destination page"""
    return render_template('destination/index.html', destination=destination)

@app.route('/route/<origin>/<destination>')
def route(origin, destination):
    """Route page"""
    return render_template('route/index.html', origin=origin, destination=destination)

@app.route('/country/<country>')
def country(country):
    """Country page"""
    return render_template('country/index.html', country=country)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500

# Template context processor
@app.context_processor
def inject_config():
    """Inject configuration variables into templates"""
    return {
        'GOOGLE_MAPS_API_KEY': app.config['GOOGLE_MAPS_API_KEY']
    }

# Custom template filters
@app.template_filter('from_json')
def from_json(value):
    """Convert JSON string to Python object"""
    if value:
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return []
    return []

if __name__ == '__main__':
    print("🚀 MondoExplora Flask Development Server")
    print("📍 Blog functionality enabled")
    print("🌐 Server running on http://localhost:5000")
    print("📝 Blog available at http://localhost:5000/blog")
    print("")
    print("📁 Available routes:")
    print("   - / (homepage)")
    print("   - /blog (blog home)")
    print("   - /blog/<slug> (individual posts)")
    print("   - /destination/<destination>")
    print("   - /route/<origin>/<destination>")
    print("   - /country/<country>")
    print("")
    
    # Add some sample data if database is empty
    with app.app_context():
        from blog.models import BlogPost
        from creator.models import ContentCreator, InvitationCode, PostTemplate, Admin
        
        # Create default admin account
        if not Admin.query.first():
            print("👑 Creating default admin account...")
            admin = Admin(
                username="admin",
                email="mondoexplora@gmail.com",
                full_name="System Administrator",
                role="super_admin"
            )
            admin.set_password("admin123")
            db.session.add(admin)
            db.session.commit()
            print("✅ Default admin account created!")
            print("   Username: admin")
            print("   Password: admin123")
            print("   ⚠️  IMPORTANT: Change this password immediately!")
        
        # Create sample invitation codes
        if not InvitationCode.query.first():
            print("🎫 Creating sample invitation codes...")
            
            sample_codes = [
                InvitationCode(
                    code='CREATOR2024',
                    created_by='admin',
                    is_active=True
                ),
                InvitationCode(
                    code='TRAVELWRITER',
                    created_by='admin',
                    is_active=True
                ),
                InvitationCode(
                    code='BLOGGER2024',
                    created_by='admin',
                    is_active=True
                )
            ]
            
            for code in sample_codes:
                db.session.add(code)
            
            db.session.commit()
            print("✅ Sample invitation codes created!")
            print("   Available codes: CREATOR2024, TRAVELWRITER, BLOGGER2024")
        
        # Create sample content creators
        if not ContentCreator.query.first():
            print("👤 Creating sample content creators...")
            
            from werkzeug.security import generate_password_hash
            
            sample_creators = [
                ContentCreator(
                    username='sarah_travels',
                    email='sarah@example.com',
                    password_hash=generate_password_hash('password123'),
                    full_name='Sarah Johnson',
                    nationality='American',
                    profile_picture_url='https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                    bio='Adventure seeker and travel photographer. I love exploring off-the-beaten-path destinations and sharing authentic travel experiences.',
                    interests=json.dumps(['adventure', 'photography', 'backpacking', 'culture']),
                    social_links=json.dumps({
                        'instagram': '@sarah_travels',
                        'twitter': '@sarah_travels',
                        'website': 'https://sarah-travels.com'
                    }),
                    experience_level='expert',
                    is_approved=True
                ),
                ContentCreator(
                    username='mike_explorer',
                    email='mike@example.com',
                    password_hash=generate_password_hash('password123'),
                    full_name='Mike Chen',
                    nationality='Canadian',
                    profile_picture_url='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                    bio='Food lover and cultural enthusiast. I travel to discover new cuisines and connect with local communities.',
                    interests=json.dumps(['food', 'culture', 'cities', 'history']),
                    social_links=json.dumps({
                        'instagram': '@mike_explorer',
                        'linkedin': 'linkedin.com/in/mikechen'
                    }),
                    experience_level='intermediate',
                    is_approved=True
                )
            ]
            
            for creator in sample_creators:
                db.session.add(creator)
            
            db.session.commit()
            print("✅ Sample content creators created!")
            print("   Login: sarah@example.com / mike@example.com")
            print("   Password: password123")
        
        # Create sample blog data if no posts exist
        if not BlogPost.query.first():
            print("📝 Creating sample blog posts...")
            
            # Get the first creator
            creator = ContentCreator.query.first()
            if creator:
                sample_posts = [
                    {
                        'title': 'Amazing Adventures in Thailand: From Bangkok to Phuket',
                        'slug': 'amazing-adventures-thailand-bangkok-phuket',
                        'content': 'Thailand is a country that truly captures the heart of every traveler. From the bustling streets of Bangkok to the pristine beaches of Phuket, every moment is filled with wonder and excitement. The food, the culture, the people - everything about Thailand is simply magical. In this post, I\'ll share my incredible journey through this beautiful country.',
                        'excerpt': 'Discover the magic of Thailand from bustling Bangkok to pristine Phuket beaches.',
                        'keywords': 'Thailand, Bangkok, Phuket, travel, adventure, beaches, culture',
                        'continents': 'Asia',
                        'countries': 'Thailand',
                        'images': json.dumps([
                            {'url': 'https://images.unsplash.com/photo-1508009603885-50cf7c079365?w=800&h=600&fit=crop'},
                            {'url': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&h=600&fit=crop'}
                        ]),
                        'status': 'published',
                        'author_id': creator.id
                    },
                    {
                        'title': 'Exploring the Hidden Gems of Bali: Beyond the Tourist Trail',
                        'slug': 'exploring-hidden-gems-bali-beyond-tourist-trail',
                        'content': 'While most tourists flock to the popular spots in Bali, I discovered some incredible hidden gems that made my trip truly special. From secret waterfalls to local villages untouched by mass tourism, Bali has so much more to offer than meets the eye.',
                        'excerpt': 'Venture beyond the tourist trail to discover Bali\'s most beautiful hidden spots.',
                        'keywords': 'Bali, Indonesia, hidden gems, waterfalls, local culture, off the beaten path',
                        'continents': 'Asia',
                        'countries': 'Indonesia',
                        'images': json.dumps([
                            {'url': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop'}
                        ]),
                        'status': 'published',
                        'author_id': creator.id
                    }
                ]
                
                for post_data in sample_posts:
                    post = BlogPost(**post_data)
                    db.session.add(post)
                
                db.session.commit()
                print("✅ Sample blog posts created successfully!")
        
        # Create post templates
        if not PostTemplate.query.first():
            print("📋 Creating post templates...")
            
            templates = [
                {
                    'name': 'Travel Guide',
                    'description': 'Comprehensive guide for a destination with practical tips and recommendations',
                    'template_type': 'travel_guide',
                    'content_structure': json.dumps({
                        'sections': [
                            'Introduction',
                            'Getting There',
                            'Where to Stay',
                            'What to Do',
                            'Where to Eat',
                            'Practical Tips',
                            'Conclusion'
                        ]
                    })
                },
                {
                    'name': 'Personal Story',
                    'description': 'Personal travel experience with emotional storytelling',
                    'template_type': 'personal_story',
                    'content_structure': json.dumps({
                        'sections': [
                            'The Beginning',
                            'The Journey',
                            'The Experience',
                            'The People',
                            'The Lessons',
                            'The End'
                        ]
                    })
                },
                {
                    'name': 'Photo Essay',
                    'description': 'Visual storytelling with high-quality images and captions',
                    'template_type': 'photo_essay',
                    'content_structure': json.dumps({
                        'sections': [
                            'Introduction',
                            'Photo Gallery',
                            'Behind the Scenes',
                            'Technical Details',
                            'Conclusion'
                        ]
                    })
                }
            ]
            
            for template_data in templates:
                template = PostTemplate(**template_data)
                db.session.add(template)
            
            db.session.commit()
            print("✅ Post templates created successfully!")
    
    app.run(debug=True, host='0.0.0.0', port=5000) 