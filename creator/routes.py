from flask import render_template, request, redirect, url_for, flash, session, jsonify, abort
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from . import creator_bp
from .models import db, ContentCreator, InvitationCode, BlogPost, PostTemplate, Admin
import json

# Authentication decorators
def login_required(f):
    """Decorator to require creator login for routes"""
    def decorated_function(*args, **kwargs):
        if 'creator_id' not in session:
            flash('Please log in to access this page.', 'error')
            return redirect(url_for('creator.login'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def admin_required(f):
    """Decorator to require admin login for routes"""
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            flash('Admin access required. Please log in.', 'error')
            return redirect(url_for('creator.admin_login'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# Login page
@creator_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Content creator login"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        creator = ContentCreator.query.filter_by(email=email).first()
        
        if creator and check_password_hash(creator.password_hash, password):
            if not creator.is_active:
                flash('Your account has been deactivated. Please contact support.', 'error')
                return redirect(url_for('creator.login'))
            
            if not creator.is_approved:
                flash('Your account is pending approval. You will be notified when approved.', 'info')
                return redirect(url_for('creator.login'))
            
            # Update last login
            creator.last_login = datetime.utcnow()
            db.session.commit()
            
            # Set session
            session['creator_id'] = creator.id
            session['creator_username'] = creator.username
            session['creator_name'] = creator.full_name
            
            flash(f'Welcome back, {creator.full_name}!', 'success')
            return redirect(url_for('creator.dashboard'))
        else:
            flash('Invalid email or password.', 'error')
    
    return render_template('creator/login.html')

# Registration page
@creator_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Content creator registration with invitation code"""
    if request.method == 'POST':
        invitation_code = request.form.get('invitation_code')
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        full_name = request.form.get('full_name')
        nationality = request.form.get('nationality')
        
        # Validate invitation code
        invite = InvitationCode.query.filter_by(code=invitation_code, is_active=True).first()
        if not invite or invite.is_used or invite.is_expired():
            flash('Invalid or expired invitation code.', 'error')
            return redirect(url_for('creator.register'))
        
        # Check if username or email already exists
        if ContentCreator.query.filter_by(username=username).first():
            flash('Username already exists.', 'error')
            return redirect(url_for('creator.register'))
        
        if ContentCreator.query.filter_by(email=email).first():
            flash('Email already registered.', 'error')
            return redirect(url_for('creator.register'))
        
        # Create new creator
        creator = ContentCreator(
            username=username,
            email=email,
            password_hash=generate_password_hash(password),
            full_name=full_name,
            nationality=nationality,
            invitation_code=invitation_code
        )
        
        # Mark invitation code as used
        invite.is_used = True
        invite.used_by = creator.id
        invite.used_at = datetime.utcnow()
        
        db.session.add(creator)
        db.session.commit()
        
        flash('Registration successful! Your account is pending approval.', 'success')
        return redirect(url_for('creator.login'))
    
    return render_template('creator/register.html')

# Logout
@creator_bp.route('/logout')
def logout():
    """Logout content creator"""
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('creator.login'))

# Dashboard
@creator_bp.route('/dashboard')
@login_required
def dashboard():
    """Content creator dashboard"""
    creator_id = session['creator_id']
    creator = ContentCreator.query.get(creator_id)
    
    # Get creator's posts
    posts = BlogPost.query.filter_by(author_id=creator_id).order_by(BlogPost.created_at.desc()).limit(5).all()
    
    # Get stats
    total_posts = BlogPost.query.filter_by(author_id=creator_id).count()
    published_posts = BlogPost.query.filter_by(author_id=creator_id, status='published').count()
    draft_posts = BlogPost.query.filter_by(author_id=creator_id, status='draft').count()
    total_views = sum(post.views for post in BlogPost.query.filter_by(author_id=creator_id))
    
    stats = {
        'total_posts': total_posts,
        'published_posts': published_posts,
        'draft_posts': draft_posts,
        'total_views': total_views
    }
    
    return render_template('creator/dashboard.html', 
                         creator=creator, 
                         posts=posts, 
                         stats=stats)

# Profile management
@creator_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """Edit creator profile"""
    creator_id = session['creator_id']
    creator = ContentCreator.query.get(creator_id)
    
    if request.method == 'POST':
        creator.full_name = request.form.get('full_name')
        creator.nationality = request.form.get('nationality')
        creator.bio = request.form.get('bio')
        creator.experience_level = request.form.get('experience_level')
        
        # Handle interests (convert list to JSON)
        interests = request.form.getlist('interests')
        creator.interests = json.dumps(interests)
        
        # Handle social links
        social_links = {
            'instagram': request.form.get('instagram'),
            'twitter': request.form.get('twitter'),
            'linkedin': request.form.get('linkedin'),
            'website': request.form.get('website')
        }
        creator.social_links = json.dumps(social_links)
        
        db.session.commit()
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('creator.profile'))
    
    return render_template('creator/profile.html', creator=creator)

# Post management
@creator_bp.route('/posts')
@login_required
def posts():
    """View all creator's posts"""
    creator_id = session['creator_id']
    creator = ContentCreator.query.get(creator_id)
    posts = BlogPost.query.filter_by(author_id=creator_id).order_by(BlogPost.created_at.desc()).all()
    
    # Calculate stats
    total_posts = len(posts)
    published_posts = len([p for p in posts if p.status == 'published'])
    draft_posts = len([p for p in posts if p.status in ['draft', 'submitted']])
    total_views = sum(p.views for p in posts)
    
    stats = {
        'total_posts': total_posts,
        'published_posts': published_posts,
        'draft_posts': draft_posts,
        'total_views': total_views
    }
    
    return render_template('creator/posts.html', creator=creator, posts=posts, stats=stats)

# Create new post
@creator_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create_post():
    """Create a new blog post"""
    creator_id = session['creator_id']
    
    if request.method == 'POST':
        try:
            # Get form data
            title = request.form.get('title')
            description = request.form.get('description')
            content = request.form.get('content')
            custom_slug = request.form.get('slug')
            
            # Get destinations and their content
            destinations = request.form.getlist('destinations[]')
            destination_contents = request.form.getlist('destination_contents[]')
            
            # Get countries and tags
            countries_json = request.form.get('countries', '[]')
            tags_json = request.form.get('tags', '[]')
            countries = json.loads(countries_json)
            tags = json.loads(tags_json)
            
            # Validate required fields
            if not title or not description or not content:
                return jsonify({'success': False, 'message': 'Title, description, and content are required'})
            
            if len(destinations) < 1:
                return jsonify({'success': False, 'message': 'At least one destination is required'})
            
            # Generate or use custom slug
            if custom_slug:
                slug = custom_slug
            else:
                slug = BlogPost.generate_slug(title)
            
            # Check if slug already exists
            if BlogPost.query.filter_by(slug=slug).first():
                return jsonify({'success': False, 'message': 'A post with this slug already exists. Please choose a different one.'})
            
            # Handle image uploads
            images = []
            for i in range(1, 4):
                image_file = request.files.get(f'images[{i-1}]')
                if image_file and image_file.filename:
                    # Save image (you'll need to implement proper image handling)
                    filename = f"post_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{i}.jpg"
                    # For now, just store the filename
                    images.append(filename)
            
            if len(images) < 3:
                return jsonify({'success': False, 'message': 'Three images are required'})
            
            # Get coordinates from form data
            coordinates = []
            for i, dest in enumerate(destinations):
                lat = request.form.get(f'destination{i+1}_lat', '')
                lng = request.form.get(f'destination{i+1}_lng', '')
                if lat and lng:
                    coordinates.append({
                        'destination': dest,
                        'content': destination_contents[i] if i < len(destination_contents) else '',
                        'lat': float(lat),
                        'lng': float(lng)
                    })
                else:
                    coordinates.append({
                        'destination': dest,
                        'content': destination_contents[i] if i < len(destination_contents) else '',
                        'lat': None,
                        'lng': None
                    })

            # Create journey data
            journey_data = {
                'destinations': destinations,
                'destination_contents': destination_contents,
                'coordinates': coordinates
            }
            
            # Create new post
            post = BlogPost(
                title=title,
                slug=slug,
                content=content,
                excerpt=description,
                keywords=json.dumps(tags),
                countries=json.dumps(countries),
                continents=json.dumps([]),  # Will be auto-generated from countries
                author_id=creator_id,
                status='submitted',  # Posts need admin approval
                editor_notes=json.dumps(journey_data)
            )
            
            db.session.add(post)
            db.session.commit()
            
            return jsonify({'success': True, 'message': 'Post created successfully!', 'post_id': post.id})
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Error creating post: {str(e)}'})
    
    # Get available templates
    templates = PostTemplate.query.filter_by(is_active=True).all()
    
    return render_template('creator/create_post.html', templates=templates)

# Edit post
@creator_bp.route('/edit/<int:post_id>', methods=['GET', 'POST'])
@login_required
def edit_post(post_id):
    """Edit an existing blog post"""
    creator_id = session['creator_id']
    post = BlogPost.query.filter_by(id=post_id, author_id=creator_id).first()
    
    if not post:
        abort(404)
    
    if request.method == 'POST':
        post.title = request.form.get('title')
        post.content = request.form.get('content')
        post.excerpt = request.form.get('excerpt')
        post.keywords = request.form.get('keywords')
        post.continents = request.form.get('continents')
        post.countries = request.form.get('countries')
        post.status = request.form.get('status', 'draft')
        post.updated_at = datetime.utcnow()
        
        # Update slug if title changed
        new_slug = BlogPost.generate_slug(post.title)
        if new_slug != post.slug:
            # Check if new slug already exists
            if BlogPost.query.filter_by(slug=new_slug).first():
                flash('A post with this title already exists. Please choose a different title.', 'error')
                return redirect(url_for('creator.edit_post', post_id=post_id))
            post.slug = new_slug
        
        if post.status == 'published' and not post.published_at:
            post.published_at = datetime.utcnow()
        
        db.session.commit()
        flash('Post updated successfully!', 'success')
        return redirect(url_for('creator.posts'))
    
    return render_template('creator/edit_post.html', post=post)

# Delete post
@creator_bp.route('/delete/<int:post_id>', methods=['POST'])
@login_required
def delete_post(post_id):
    """Delete a blog post"""
    creator_id = session['creator_id']
    post = BlogPost.query.filter_by(id=post_id, author_id=creator_id).first()
    
    if not post:
        abort(404)
    
    db.session.delete(post)
    db.session.commit()
    
    flash('Post deleted successfully!', 'success')
    return redirect(url_for('creator.posts'))

# Analytics
@creator_bp.route('/analytics')
@login_required
def analytics():
    """View post analytics"""
    creator_id = session['creator_id']
    creator = ContentCreator.query.get(creator_id)
    
    # Get all creator's posts
    posts = BlogPost.query.filter_by(author_id=creator_id).order_by(BlogPost.created_at.desc()).all()
    
    # Calculate analytics
    total_views = sum(post.views for post in posts)
    avg_views = total_views / len(posts) if posts else 0
    
    # Get top performing posts
    top_posts = sorted(posts, key=lambda x: x.views, reverse=True)[:5]
    
    analytics_data = {
        'total_posts': len(posts),
        'total_views': total_views,
        'avg_views': round(avg_views, 1),
        'top_posts': top_posts
    }
    
    return render_template('creator/analytics.html', 
                         creator=creator, 
                         analytics=analytics_data)

# Admin authentication
@creator_bp.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Admin login page"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        admin = Admin.query.filter_by(username=username).first()
        
        if admin and admin.check_password(password):
            if not admin.is_active:
                flash('Your admin account has been deactivated.', 'error')
                return redirect(url_for('creator.admin_login'))
            
            # Update last login
            admin.last_login = datetime.utcnow()
            db.session.commit()
            
            # Set session
            session['admin_id'] = admin.id
            session['admin_username'] = admin.username
            session['admin_name'] = admin.full_name
            session['admin_role'] = admin.role
            
            flash(f'Welcome back, {admin.full_name}!', 'success')
            return redirect(url_for('creator.admin_dashboard'))
        else:
            flash('Invalid username or password.', 'error')
    
    return render_template('creator/admin_login.html')

@creator_bp.route('/admin/logout')
def admin_logout():
    """Admin logout"""
    session.pop('admin_id', None)
    session.pop('admin_username', None)
    session.pop('admin_name', None)
    session.pop('admin_role', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('creator.admin_login'))

# Admin routes
@creator_bp.route('/admin')
@admin_required
def admin_dashboard():
    """Admin dashboard for managing content creators"""
    # Get statistics
    stats = {
        'total_creators': ContentCreator.query.count(),
        'pending_approval': ContentCreator.query.filter_by(is_approved=False).count(),
        'active_creators': ContentCreator.query.filter_by(is_approved=True, is_active=True).count(),
        'total_posts': BlogPost.query.count()
    }
    
    # Get pending creators
    pending_creators = ContentCreator.query.filter_by(is_approved=False).order_by(ContentCreator.created_at.desc()).all()
    
    # Get active creators
    active_creators = ContentCreator.query.filter_by(is_approved=True, is_active=True).order_by(ContentCreator.created_at.desc()).all()
    
    # Get invitation codes
    invitation_codes = InvitationCode.query.filter_by(is_active=True).order_by(InvitationCode.created_at.desc()).all()
    
    return render_template('creator/admin_dashboard.html', 
                         stats=stats, 
                         pending_creators=pending_creators,
                         active_creators=active_creators,
                         invitation_codes=invitation_codes)

@creator_bp.route('/admin/creator/<int:creator_id>')
@admin_required
def view_creator(creator_id):
    """View detailed creator information"""
    creator = ContentCreator.query.get_or_404(creator_id)
    posts = BlogPost.query.filter_by(author_id=creator_id).order_by(BlogPost.created_at.desc()).all()
    return render_template('creator/view_creator.html', creator=creator, posts=posts)

@creator_bp.route('/admin/creator/<int:creator_id>/approve', methods=['POST'])
@admin_required
def approve_creator(creator_id):
    """Approve a content creator"""
    creator = ContentCreator.query.get_or_404(creator_id)
    creator.is_approved = True
    creator.is_active = True
    db.session.commit()
    flash(f'{creator.full_name} has been approved as a content creator!', 'success')
    return redirect(url_for('creator.admin_dashboard'))

@creator_bp.route('/admin/creator/<int:creator_id>/reject', methods=['POST'])
@admin_required
def reject_creator(creator_id):
    """Reject a content creator"""
    creator = ContentCreator.query.get_or_404(creator_id)
    creator.is_approved = False
    creator.is_active = False
    db.session.commit()
    flash(f'{creator.full_name} has been rejected.', 'error')
    return redirect(url_for('creator.admin_dashboard'))

@creator_bp.route('/admin/creator/<int:creator_id>/deactivate', methods=['POST'])
@admin_required
def deactivate_creator(creator_id):
    """Deactivate a content creator"""
    creator = ContentCreator.query.get_or_404(creator_id)
    creator.is_active = False
    db.session.commit()
    flash(f'{creator.full_name} has been deactivated.', 'error')
    return redirect(url_for('creator.admin_dashboard'))

@creator_bp.route('/admin/invitation/create', methods=['POST'])
@admin_required
def create_invitation():
    """Create a new invitation code"""
    code = request.form.get('code')
    expires_at_str = request.form.get('expires_at')
    
    if not code:
        flash('Invitation code is required.', 'error')
        return redirect(url_for('creator.admin_dashboard'))
    
    # Check if code already exists
    existing_code = InvitationCode.query.filter_by(code=code).first()
    if existing_code:
        flash('This invitation code already exists.', 'error')
        return redirect(url_for('creator.admin_dashboard'))
    
    # Create new invitation code
    invitation = InvitationCode(
        code=code,
        created_by='admin',
        is_active=True
    )
    
    if expires_at_str:
        try:
            invitation.expires_at = datetime.strptime(expires_at_str, '%Y-%m-%dT%H:%M')
        except ValueError:
            flash('Invalid date format.', 'error')
            return redirect(url_for('creator.admin_dashboard'))
    
    db.session.add(invitation)
    db.session.commit()
    
    flash(f'Invitation code "{code}" created successfully!', 'success')
    return redirect(url_for('creator.admin_dashboard')) 