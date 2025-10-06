# MondoExplora Blog

This is the blog functionality for your MondoExplora travel website. The blog allows users to share travel stories, experiences, and adventures from around the world.

## Features

- **Blog Home Page** - Display all published blog posts with pagination
- **Individual Blog Posts** - Full article view with related posts
- **Author Profiles** - View all posts by a specific author
- **Category/Continent Pages** - Filter posts by continent
- **Search Functionality** - Search posts by keywords, title, or content
- **Responsive Design** - Works on all devices

## File Structure

```
blog/
├── __init__.py          # Blog blueprint initialization
├── models.py            # Database models (User, BlogPost)
├── routes.py            # Blog routes and views
└── templates/
    └── blog/
        ├── home.html    # Blog home page
        └── post.html    # Individual blog post page
```

## Database Models

### User Model
- `id` - Primary key
- `username` - Unique username
- `email` - User email
- `password_hash` - Hashed password
- `profile_picture_url` - Profile image URL
- `bio` - User biography
- `created_at` - Account creation date
- `is_active` - Account status

### BlogPost Model
- `id` - Primary key
- `title` - Post title
- `slug` - URL-friendly title
- `content` - Post content
- `excerpt` - Short description
- `keywords` - Comma-separated keywords
- `continents` - Comma-separated continents
- `countries` - Comma-separated countries
- `images` - JSON string of image URLs
- `status` - Post status (draft, published, approved)
- `created_at` - Creation date
- `updated_at` - Last update date
- `published_at` - Publication date
- `author_id` - Foreign key to User
- `views` - View count

## Routes

- `/blog/` - Blog home page
- `/blog/<slug>` - Individual blog post
- `/blog/author/<username>` - Author profile page
- `/blog/continent/<continent>` - Posts by continent
- `/blog/search` - Search posts

## Running the Blog

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask development server:
```bash
python flask_app.py
```

3. Visit `http://localhost:5000/blog` to see the blog

### Sample Data

The development server automatically creates sample blog data if the database is empty:
- Sample user: `traveler123`
- Sample posts about Thailand, Bali, and French Riviera

## Adding New Posts

To add new blog posts, you can:

1. **Use the database directly** (for development):
```python
from flask_app import app
from blog.models import db, User, BlogPost

with app.app_context():
    # Create a new post
    post = BlogPost(
        title="Your Post Title",
        slug="your-post-slug",
        content="Your post content...",
        author_id=1,  # User ID
        status="approved"
    )
    db.session.add(post)
    db.session.commit()
```

2. **Create an admin interface** (future enhancement)

## Styling

The blog uses a clean, modern design that matches your existing MondoExplora theme:
- Color scheme: `#2a3f59` (dark blue), `#ff5a5f` (coral)
- Font: Inter (Google Fonts)
- Responsive grid layout
- Card-based design for posts

## Integration with Main Site

The blog is integrated with your main site navigation:
- Blog link in main navigation
- Consistent header/footer design
- Links to destinations and routes

## Future Enhancements

- [ ] Admin interface for creating/editing posts
- [ ] User registration and authentication
- [ ] Comments system
- [ ] Social media sharing
- [ ] Email newsletter integration
- [ ] SEO optimization
- [ ] Image upload functionality
- [ ] Tags and categories system

## Production Deployment

For production deployment on Netlify, you'll need to:
1. Convert the Flask routes to Netlify Functions
2. Set up a database (PostgreSQL, MongoDB, etc.)
3. Configure environment variables
4. Set up image hosting (Cloudinary, AWS S3, etc.)

The current Flask setup is perfect for local development and testing. 