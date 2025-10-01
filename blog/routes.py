from flask import render_template, request, redirect, url_for, flash, abort
from . import blog_bp
from .models import db, BlogPost
from creator.models import ContentCreator as User
from datetime import datetime

# Main blog page - shows all published posts
@blog_bp.route('/')
def blog_home():
    """Main blog page showing all published posts"""
    page = request.args.get('page', 1, type=int)
    per_page = 9  # Show 9 posts per page
    
    # Get published posts, ordered by newest first
    posts = BlogPost.query.filter_by(status='approved').order_by(
        BlogPost.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return render_template('blog/home.html', posts=posts)

# Individual blog post page
@blog_bp.route('/<slug>')
def blog_post(slug):
    """Show individual blog post by slug"""
    post = BlogPost.query.filter_by(slug=slug, status='approved').first()
    
    if not post:
        abort(404)  # Post not found
    
    # Get related posts (same countries or continents)
    related_posts = BlogPost.query.filter(
        BlogPost.id != post.id,
        BlogPost.status == 'approved'
    ).limit(3).all()
    
    return render_template('blog/post.html', post=post, related_posts=related_posts)

# Author profile page
@blog_bp.route('/author/<username>')
def author_profile(username):
    """Show author's profile and all their posts"""
    author = User.query.filter_by(username=username).first()
    
    if not author:
        abort(404)  # Author not found
    
    page = request.args.get('page', 1, type=int)
    per_page = 6
    
    # Get author's published posts
    posts = BlogPost.query.filter_by(
        author_id=author.id, 
        status='approved'
    ).order_by(BlogPost.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return render_template('blog/author.html', author=author, posts=posts)

# Category/continent page
@blog_bp.route('/continent/<continent>')
def continent_posts(continent):
    """Show all posts about a specific continent"""
    page = request.args.get('page', 1, type=int)
    per_page = 9
    
    # Get posts that mention this continent
    posts = BlogPost.query.filter(
        BlogPost.continents.contains(continent),
        BlogPost.status == 'approved'
    ).order_by(BlogPost.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return render_template('blog/continent.html', 
                         continent=continent, 
                         posts=posts)

# Search functionality
@blog_bp.route('/search')
def search_posts():
    """Search blog posts by keywords"""
    query = request.args.get('q', '')
    page = request.args.get('page', 1, type=int)
    per_page = 9
    
    if query:
        # Search in title, content, and keywords
        posts = BlogPost.query.filter(
            BlogPost.status == 'approved',
            db.or_(
                BlogPost.title.contains(query),
                BlogPost.content.contains(query),
                BlogPost.keywords.contains(query)
            )
        ).order_by(BlogPost.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
    else:
        posts = None
    
    return render_template('blog/search.html', posts=posts, query=query) 