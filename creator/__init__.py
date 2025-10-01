from flask import Blueprint

creator_bp = Blueprint('creator', __name__, template_folder='templates', url_prefix='/creator')

def init_creator(app):
    app.register_blueprint(creator_bp)
    
    # Import routes after blueprint is created
    from . import routes 