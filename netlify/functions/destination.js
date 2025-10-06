const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // Extract destination name from the URL path
    const pathSegments = event.path.split('/').filter(segment => segment);
    const destinationIndex = pathSegments.indexOf('destination');
    const destinationName = pathSegments[destinationIndex + 1];

    if (!destinationName) {
      return {
        statusCode: 404,
        body: 'Destination not found'
      };
    }

    // Embedded destination template
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title id="dynamic-title">Best Hotel Deals in [Destination] | Luxury Hotels & Resorts | ExploraMondo</title>
  <meta name="description" id="dynamic-description" content="Find the best hotel deals in [Destination]. Compare prices, read reviews, and book luxury hotels with exclusive discounts. Best rates guaranteed.">
  <meta name="keywords" id="dynamic-keywords" content="hotels in [Destination], [Destination] hotel deals, luxury hotels [Destination], best hotels [Destination], hotel booking [Destination]">
  <meta name="author" content="ExploraMondo">
  <meta name="robots" content="index, follow">
  <meta property="og:title" id="og-title" content="Best Hotel Deals in [Destination] | ExploraMondo">
  <meta property="og:description" id="og-description" content="Discover amazing hotel deals in [Destination]. Book luxury accommodations with exclusive discounts and special offers.">
  <meta property="og:type" content="website">
  <meta property="og:url" id="og-url" content="">
  <meta property="og:image" content="https://images.unsplash.com/photo-1468413253725-0d5181091126?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" id="twitter-title" content="Best Hotel Deals in [Destination]">
  <meta name="twitter:description" id="twitter-description" content="Find luxury hotels in [Destination] with exclusive deals and discounts.">
  <meta name="twitter:image" content="https://images.unsplash.com/photo-1468413253725-0d5181091126?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D">
  <link rel="canonical" id="canonical-url" href="">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/destination.css?v=4">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "ExploraMondo",
    "url": "https://exploramondo.com",
    "description": "Find the best hotel deals and luxury accommodations worldwide",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "serviceType": "Hotel Booking",
    "areaServed": "Worldwide"
  }
  </script>
</head>
<body>
  <section class="hero-section">
    <div class="logo-overlay"><span>EXPLORA</span><span>MONDO</span></div>
    <div class="page-header">
      <h1 id="destination-title">Best Hotel Deals in [Destination]</h1>
      <p id="destination-description">Discover amazing hotel deals and luxury accommodations in [Destination]. Book with confidence and enjoy exclusive discounts.</p>
    </div>
  </section>

  <section class="main-content" role="main">
    <div class="header-row">
      <div class="filter-inline">
        <label for="sortSelect" class="filter-label">Sort by:</label>
        <select id="sortSelect" class="filter-select">
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>
    <div class="hotel-grid" id="hotel-container"></div>
  </section>

  <footer>
    <nav class="footer-column">
      <h4>About ExploraMondo</h4>
      <ul>
        <li><a href="#">Our Story</a></li>
        <li><a href="#">Terms & Conditions</a></li>
        <li><a href="#">Privacy Policy</a></li>
      </ul>
    </nav>
    <nav class="footer-column">
      <h4>Destinations</h4>
      <ul>
        <li><a href="#">Bangkok</a></li>
        <li><a href="#">Phuket</a></li>
        <li><a href="#">Bali</a></li>
        <li><a href="#">Tokyo</a></li>
      </ul>
    </nav>
    <nav class="footer-column">
      <h4>Get Help</h4>
      <ul>
        <li><a href="#">Support</a></li>
        <li><a href="#">FAQs</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
    <p>© 2025 ExploraMondo. All rights reserved.</p>
  </footer>

  <script>
    // Function to format destination name (replace underscores and hyphens with spaces and capitalize properly)
    function formatDestinationName(dest) {
      return dest.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
    }

    // Extract destination from URL path or query parameters
    function getDestinationFromPath() {
      const pathSegments = window.location.pathname.split('/').filter(segment => segment);
      
      // Look for 'destination' in the path and get the next segment
      const destinationIndex = pathSegments.indexOf('destination');
      if (destinationIndex !== -1 && pathSegments.length >= destinationIndex + 2) {
        const nextSegment = pathSegments[destinationIndex + 1];
        // Only use path segment if it's not a file extension (like .html)
        if (!nextSegment.includes('.')) {
          return nextSegment;
        }
      }
      
      // Fallback to query parameters for backward compatibility
      const params = new URLSearchParams(window.location.search);
      return params.get('d') || '';
    }

    const destination = getDestinationFromPath();
    const formattedDestination = formatDestinationName(destination);
    const destLower = destination.toLowerCase().replace(/ /g, '_');
    const jsonUrl = \`/data/hotels/\${destLower}.json\`;

    // Wait for DOM to be ready before doing anything
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize allHotels variable
      let allHotels = [];
      // Update meta tags dynamically
      const seoTitle = \`Best Hotel Deals in \${formattedDestination} | Luxury Hotels & Resorts | ExploraMondo\`;
      const seoDescription = \`Find the best hotel deals in \${formattedDestination}. Compare prices, read reviews, and book luxury hotels with exclusive discounts. Best rates guaranteed.\`;
      const seoKeywords = \`hotels in \${formattedDestination}, \${formattedDestination} hotel deals, luxury hotels \${formattedDestination}, best hotels \${formattedDestination}, hotel booking \${formattedDestination}\`;
      
      document.title = seoTitle;
      
      // Update meta tags safely
      const metaDescription = document.querySelector('meta[name="description"]');
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      const metaOgTitle = document.querySelector('meta[property="og:title"]');
      const metaOgDescription = document.querySelector('meta[property="og:description"]');
      const metaOgUrl = document.querySelector('meta[property="og:url"]');
      const metaTwitterTitle = document.querySelector('meta[name="twitter:title"]');
      const metaTwitterDescription = document.querySelector('meta[name="twitter:description"]');
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      
      if (metaDescription) metaDescription.setAttribute('content', seoDescription);
      if (metaKeywords) metaKeywords.setAttribute('content', seoKeywords);
      if (metaOgTitle) metaOgTitle.setAttribute('content', seoTitle);
      if (metaOgDescription) metaOgDescription.setAttribute('content', seoDescription);
      if (metaOgUrl) metaOgUrl.setAttribute('content', window.location.href);
      if (metaTwitterTitle) metaTwitterTitle.setAttribute('content', seoTitle);
      if (metaTwitterDescription) metaTwitterDescription.setAttribute('content', seoDescription);
      if (canonicalLink) canonicalLink.setAttribute('href', window.location.href);

      // Update page content
      const titleElement = document.getElementById('destination-title');
      const descriptionElement = document.getElementById('destination-description');
      
      if (titleElement) titleElement.textContent = \`Best Hotel Deals in \${formattedDestination}\`;
      if (descriptionElement) descriptionElement.textContent = \`Discover amazing hotel deals and luxury accommodations in \${formattedDestination}. Book with confidence and enjoy exclusive discounts.\`;

      // Set a beautiful default hero image for all destinations
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        heroSection.style.backgroundImage = \`url('https://images.unsplash.com/photo-1468413253725-0d5181091126?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')\`;
      }

      // Add sorting functionality
      const sortSelect = document.getElementById('sortSelect');
      if (sortSelect) {
        sortSelect.addEventListener('change', function() {
          const sortType = this.value;
          sortHotels(sortType);
        });
      }

      // Load hotel data
      console.log('Fetching hotel data from:', jsonUrl);
      fetch(jsonUrl)
        .then(response => {
          console.log('Response status:', response.status);
          if (!response.ok) throw new Error("Hotel data not found");
          return response.json();
        })
        .then(hotels => {
          console.log('Hotels loaded:', hotels.length);
          allHotels = hotels;
          displayHotels(hotels);
        })
        .catch(error => {
          console.error("Hotel fetch error:", error);
          const container = document.getElementById('hotel-container');
          if (container) {
            container.innerHTML = \`<p>No hotel data available for this destination. Error: \${error.message}</p>\`;
          }
        });

      function sortHotels(sortType) {
        if (!allHotels.length) return;
        
        let sortedHotels = [...allHotels];
        
        switch(sortType) {
          case 'price-low':
            sortedHotels.sort((a, b) => a.price - b.price);
            break;
          case 'price-high':
            sortedHotels.sort((a, b) => b.price - a.price);
            break;
          case 'name':
            sortedHotels.sort((a, b) => a.vendor_name.localeCompare(b.vendor_name));
            break;
          case 'rating':
            // For now, keep original order since we don't have ratings
            break;
          default:
            break;
        }
        
        displayHotels(sortedHotels);
      }

      function displayHotels(hotels) {
        const container = document.getElementById('hotel-container');
        container.innerHTML = '';
        hotels.slice(0, 8).forEach(hotel => {
          const card = document.createElement('div');
          card.className = 'hotel-card';
          card.innerHTML = \`
            <a href="\${hotel.link}" target="_blank">
              <div class="hotel-image-container">
                <img src="\${hotel.hero_image}" alt="\${hotel.vendor_name}" />
                <div class="hotel-price"><del>$\${hotel.value}</del> $\${hotel.price}</div>
              </div>
              <div class="hotel-card-content">
                <h4>\${hotel.vendor_name}</h4>
                <div class="hotel-location">\${hotel.location_heading}, \${hotel.location_subheading}</div>
                <p>\${hotel.title.length > 100 ? hotel.title.substring(0, 100) + '...' : hotel.title}</p>
                <a href="\${hotel.link}" target="_blank" class="view-more-link">View More</a>
              </div>
            </a>\`;
          container.appendChild(card);
          
          // "View More" links are always visible for better UX
        });
      }
    });
  </script>
</body>
</html>`;

    // Create the JavaScript replacement (same as Flask version)
    const scriptReplacement = `
    <script>
        // Function to format destination name (replace underscores and hyphens with spaces and capitalize properly)
        function formatDestinationName(dest) {
            return dest.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
        }

        // Extract destination from URL path
        function getDestinationFromPath() {
            const pathSegments = window.location.pathname.split('/').filter(segment => segment);
            const destinationIndex = pathSegments.indexOf('destination');
            if (destinationIndex !== -1 && pathSegments.length >= destinationIndex + 2) {
                return pathSegments[destinationIndex + 1];
            }
            return '';
        }

        const destination = getDestinationFromPath();
        const formattedDestination = formatDestinationName(destination);
        const destLower = destination.toLowerCase().replace(/ /g, '_');
        const jsonUrl = \`/data/hotels/\${destLower}.json\`;

        // Update meta tags dynamically
        const seoTitle = \`Best Hotel Deals in \${formattedDestination} | Luxury Hotels & Resorts | ExploraMondo\`;
        const seoDescription = \`Find the best hotel deals in \${formattedDestination}. Compare prices, read reviews, and book luxury hotels with exclusive discounts. Best rates guaranteed.\`;
        const seoKeywords = \`hotels in \${formattedDestination}, \${formattedDestination} hotel deals, luxury hotels \${formattedDestination}, best hotels \${formattedDestination}, hotel booking \${formattedDestination}\`;
        
        document.title = seoTitle;
        document.querySelector('meta[name="description"]').setAttribute('content', seoDescription);
        document.querySelector('meta[name="keywords"]').setAttribute('content', seoKeywords);
        document.querySelector('meta[property="og:title"]').setAttribute('content', seoTitle);
        document.querySelector('meta[property="og:description"]').setAttribute('content', seoDescription);
        document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);
        document.querySelector('meta[name="twitter:title"]').setAttribute('content', seoTitle);
        document.querySelector('meta[name="twitter:description"]').setAttribute('content', seoDescription);
        document.querySelector('link[rel="canonical"]').setAttribute('href', window.location.href);

        // Update page content safely
        const titleElement = document.getElementById('destination-title');
        const descriptionElement = document.getElementById('destination-description');
        
        if (titleElement) titleElement.textContent = \`Best Hotel Deals in \${formattedDestination}\`;
        if (descriptionElement) descriptionElement.textContent = \`Discover amazing hotel deals and luxury accommodations in \${formattedDestination}. Book with confidence and enjoy exclusive discounts.\`;

        // Global variables and functions
        let allHotels = [];
        
        function sortHotels(sortType) {
          if (!allHotels || !allHotels.length) return;
          
          let sortedHotels = [...allHotels];
          
          switch(sortType) {
            case 'price-low':
              sortedHotels.sort((a, b) => a.price - b.price);
              break;
            case 'price-high':
              sortedHotels.sort((a, b) => b.price - a.price);
              break;
            case 'name':
              sortedHotels.sort((a, b) => a.vendor_name.localeCompare(b.vendor_name));
              break;
            default:
              return;
          }
          
          displayHotels(sortedHotels);
        }
        
        function displayHotels(hotels) {
          const container = document.getElementById('hotel-container');
          if (!container) return;
          
          container.innerHTML = '';
          
          hotels.forEach(hotel => {
            const card = document.createElement('div');
            card.className = 'hotel-card';
            card.innerHTML = \`
              <div class="hotel-image-container">
                <img src="\${hotel.hero_image}" alt="\${hotel.vendor_name}" />
                <div class="hotel-price"><del>$\${hotel.value}</del> $\${hotel.price}</div>
              </div>
              <div class="hotel-card-content">
                <h4>\${hotel.vendor_name}</h4>
                <div class="hotel-location">\${hotel.location_heading}, \${hotel.location_subheading}</div>
                <p>\${hotel.title.length > 100 ? hotel.title.substring(0, 100) + '...' : hotel.title}</p>
                <a href="\${hotel.link}" target="_blank" class="view-deal-btn">View Deal</a>
              </div>\`;
            container.appendChild(card);
          });
        }

        // Load hotels when page loads
        document.addEventListener('DOMContentLoaded', function() {
          fetch(jsonUrl)
            .then(response => {
              if (!response.ok) {
                throw new Error('Hotel data not found');
              }
              return response.json();
            })
            .then(hotels => {
              allHotels = hotels;
              displayHotels(hotels);
            })
            .catch(error => {
              console.error("Hotel fetch error:", error);
              const container = document.getElementById('hotel-container');
              if (container) {
                container.innerHTML = \`<p>No hotel data available for this destination. Error: \${error.message}</p>\`;
              }
            });
        });
    </script>
    `;

    // Find and replace the entire script section
    const startScript = htmlContent.indexOf('<script>');
    const endScript = htmlContent.indexOf('</script>', startScript);
    
    if (startScript !== -1 && endScript !== -1) {
      // Replace the entire script section
      htmlContent = htmlContent.substring(0, startScript) + scriptReplacement + htmlContent.substring(endScript + 9);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600'
      },
      body: htmlContent
    };

  } catch (error) {
    console.error('Error in destination function:', error);
    return {
      statusCode: 500,
      body: 'Internal server error'
    };
  }
}; 