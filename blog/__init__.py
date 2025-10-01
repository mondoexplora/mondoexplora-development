from flask import Blueprint
from .models import db

blog_bp = Blueprint('blog', __name__, template_folder='templates')

def init_blog(app):
    db.init_app(app)
    app.register_blueprint(blog_bp, url_prefix='/blog')
    
    # Import routes after blueprint is created
    from . import routes 