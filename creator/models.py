from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
import string

# Import the shared db instance
from blog.models import db

# Import BlogPost from blog.models to avoid duplication
from blog.models import BlogPost

class ContentCreator(db.Model):
    """Content creator model for blog authors"""
    __tablename__ = 'content_creators'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    nationality = db.Column(db.String(50))
    profile_picture_url = db.Column(db.String(255))
    bio = db.Column(db.Text)
    interests = db.Column(db.Text)  # JSON string
    social_links = db.Column(db.Text)  # JSON string
    experience_level = db.Column(db.String(20), default='beginner')  # beginner, intermediate, expert
    invitation_code = db.Column(db.String(50))
    is_active = db.Column(db.Boolean, default=True)
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationship with blog posts
    posts = db.relationship('BlogPost', lazy=True)
    
    def __repr__(self):
        return f'<ContentCreator {self.username}>'
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Admin(db.Model):
    """Admin model for managing the platform"""
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='admin')  # admin, super_admin
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<Admin {self.username}>'
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

class InvitationCode(db.Model):
    """Invitation codes for content creator registration"""
    __tablename__ = 'invitation_codes'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    created_by = db.Column(db.String(50), nullable=False)  # admin username or 'system'
    used_by = db.Column(db.Integer, db.ForeignKey('content_creators.id'))
    is_used = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    used_at = db.Column(db.DateTime)
    expires_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<InvitationCode {self.code}>'
    
    def is_expired(self):
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at
    
    @staticmethod
    def generate_code(length=12):
        """Generate a random invitation code"""
        characters = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))

class PostTemplate(db.Model):
    """Templates for blog post creation"""
    __tablename__ = 'post_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    template_type = db.Column(db.String(50))  # travel_guide, review, story, etc.
    content_structure = db.Column(db.Text)  # JSON string with template structure
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<PostTemplate {self.name}>' 