from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

# User model removed - using ContentCreator from creator.models instead

class BlogPost(db.Model):
    """Blog post model"""
    __tablename__ = 'blog_posts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.Text)
    keywords = db.Column(db.String(500))  # Comma-separated keywords
    continents = db.Column(db.String(200))  # Comma-separated continents
    countries = db.Column(db.String(500))  # Comma-separated countries
    images = db.Column(db.Text)  # JSON string of image URLs
    status = db.Column(db.String(20), default='draft')  # draft, submitted, approved, published
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime)
    author_id = db.Column(db.Integer, db.ForeignKey('content_creators.id'), nullable=False)
    editor_notes = db.Column(db.Text)
    views = db.Column(db.Integer, default=0)
    
    # Relationship with content creator (no backref to avoid conflicts)
    author = db.relationship('ContentCreator', lazy=True)
    
    def __repr__(self):
        return f'<BlogPost {self.title}>'
    
    def to_dict(self):
        """Convert blog post to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'content': self.content,
            'excerpt': self.excerpt,
            'keywords': self.keywords,
            'continents': self.continents,
            'countries': self.countries,
            'images': self.images,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'author_id': self.author_id,
            'editor_notes': self.editor_notes,
            'views': self.views,
            'author': {
                'id': self.author.id,
                'username': self.author.username,
                'profile_picture_url': self.author.profile_picture_url
            } if self.author else None
        }
    
    @staticmethod
    def generate_slug(title):
        """Generate a URL-friendly slug from title"""
        import re
        # Convert to lowercase and replace spaces with hyphens
        slug = re.sub(r'[^\w\s-]', '', title.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-') 