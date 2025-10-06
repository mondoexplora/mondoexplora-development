import os

# Try to load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # If python-dotenv is not available, continue without it
    pass

class Config:
    """Application configuration"""
    
    # Flask settings
    SECRET_KEY = os.environ.get('FLASK_SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Database settings
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///instance/mondoexplora.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Google Maps API settings
    GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY') or 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg'
    
    # Admin settings
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL') or 'mondoexplora@gmail.com'
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') or 'admin123'
    
    # Content Creator settings
    DEFAULT_INVITATION_CODES = [
        'CREATOR2024',
        'TRAVELWRITER',
        'BLOGGER2024'
    ]

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    
    # In production, these should be set via environment variables
    SECRET_KEY = os.environ.get('FLASK_SECRET_KEY')
    GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
} 