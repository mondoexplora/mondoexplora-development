const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // Extract route parameters from the URL path
    const pathSegments = event.path.split('/').filter(segment => segment);
    const routeIndex = pathSegments.indexOf('route');
    const fromLocation = pathSegments[routeIndex + 1];
    const toLocation = pathSegments[routeIndex + 2];

    if (!fromLocation || !toLocation) {
      return {
        statusCode: 404,
        body: 'Route not found'
      };
    }

    // Embedded route template
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title id="dynamic-title">Travel Landing Page | Compare Travel Modes & Book Hotels</title>
  <meta name="description" id="dynamic-description" content="Plan your travel routes and book top hotel deals with ExploraMondo. Discover routes, compare travel modes, and explore luxury hotel promotions near top destinations.">
  <meta name="keywords" id="dynamic-keywords" content="travel routes, flights, trains, buses, hotels, travel comparison">
  <meta name="author" content="ExploraMondo">
  <meta name="robots" content="index, follow">
  <meta property="og:title" id="og-title" content="Travel Landing Page | Compare Travel Modes & Book Hotels">
  <meta property="og:description" id="og-description" content="Plan your travel routes and book top hotel deals with ExploraMondo.">
  <meta property="og:type" content="website">
  <meta property="og:url" id="og-url" content="">
  <meta property="og:image" content="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1748&&auto=format&fit=crop&w=1600&q=80">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" id="twitter-title" content="Travel Landing Page | Compare Travel Modes & Book Hotels">
  <meta name="twitter:description" id="twitter-description" content="Plan your travel routes and book top hotel deals with ExploraMondo.">
  <link rel="canonical" id="canonical-url" href="">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/route.css">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "ExploraMondo",
    "url": "https://exploramondo.com",
    "description": "Compare travel modes and book hotels with exclusive deals",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "serviceType": "Travel Booking",
    "areaServed": "Worldwide"
  }
  </script>
</head>
<body>
  <nav aria-label="Breadcrumb">
    <ol class="breadcrumb">
      <li><a href="/">Home</a></li>
      <li><a href="/route/">Routes</a></li>
      <li aria-current="page" id="breadcrumb-current">Loading...</li>
    </ol>
  </nav>

  <section class="hero">
    <div class="hero-logo"><span>EXPLORA</span><span>MONDO</span></div>
    <h1 id="route-heading">Loading...</h1>
    <p class="subheadline" id="route-description">Loading description...</p>
    <div class="search-box">
      <input type="text" placeholder="Origin" id="origin-input">
      <input type="text" placeholder="Destination" id="destination-input">
      <button id="compareBtn">Compare Travel Modes</button>
    </div>
    <div class="affiliate-inline">
      <input type="checkbox" id="affiliateToggle" checked>
      <label for="affiliateToggle">Search hotel deals on LuxuryEscapes.com</label>
    </div>
  </section>

  <section class="main-content" role="main">
    <div class="section-header">
      <h2 id="deal-title">Best Hotel Deals</h2>
      <p id="deal-subtitle"></p>
    </div>
    <div class="hotel-card-container" id="hotel-container"></div>
  </section>

  <!-- Travel Modes Comparison Section -->
  <section class="travel-modes" id="travel-modes-section">
    <div class="section-header">
      <h2>Travel Options</h2>
      <p>Compare different ways to travel between these destinations</p>
    </div>
    <div class="travel-modes-grid" id="travel-modes-container">
      <!-- Travel mode cards will be populated here -->
    </div>
  </section>

  <!-- New Quick Tips Section -->
  <section class="quick-tips">
    <div class="section-header">
      <h2>Travel Tips</h2>
      <p>Make the most of your journey</p>
    </div>
    <div class="tips-grid">
      <div class="tip-card">
        <div class="tip-icon">✈️</div>
        <h3>Best Time to Book</h3>
        <p>Book flights 2-3 months in advance for the best prices. Tuesday and Wednesday flights are often cheaper.</p>
      </div>
      <div class="tip-card">
        <div class="tip-icon">🏨</div>
        <h3>Hotel Booking</h3>
        <p>Book hotels 1-2 months ahead for popular destinations. Consider booking refundable rates for flexibility.</p>
      </div>
      <div class="tip-card">
        <div class="tip-icon">🎫</div>
        <h3>Travel Documents</h3>
        <p>Ensure your passport is valid for at least 6 months beyond your travel dates. Check visa requirements early.</p>
      </div>
      <div class="tip-card">
        <div class="tip-icon">💳</div>
        <h3>Payment Methods</h3>
        <p>Use credit cards with travel rewards. Consider getting a travel card with no foreign transaction fees.</p>
      </div>
    </div>
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
        <li><a href="/destination/bangkok">Bangkok</a></li>
        <li><a href="/destination/phuket">Phuket</a></li>
        <li><a href="/destination/bali">Bali</a></li>
        <li><a href="/destination/tokyo">Tokyo</a></li>
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

    // Extract origin and destination from URL path
    function getRouteFromPath() {
      const pathSegments = window.location.pathname.split('/').filter(segment => segment);
      
      // Look for 'route' in the path and get the next two segments
      const routeIndex = pathSegments.indexOf('route');
      if (routeIndex !== -1 && pathSegments.length >= routeIndex + 3) {
        return {
          origin: pathSegments[routeIndex + 1],
          destination: pathSegments[routeIndex + 2]
        };
      }
      
      // Fallback to query parameters for backward compatibility
      const params = new URLSearchParams(window.location.search);
      return {
        origin: params.get('origin') || '',
        destination: params.get('destination') || ''
      };
    }

    const { origin, destination } = getRouteFromPath();
    
    // Format both origin and destination names for display
    const formattedOrigin = formatDestinationName(origin);
    const formattedDestination = formatDestinationName(destination);

    const destLower = destination.toLowerCase().replace(/ /g, '_');
    const jsonUrl = \`/data/hotels/\${destLower}.json\`;

    // Update meta tags dynamically
    const seoTitle = \`\${formattedOrigin} to \${formattedDestination} | Compare Travel Modes & Hotel deals\`;
    const seoDescription = \`Compare travel modes from \${formattedOrigin} to \${formattedDestination} in ExploraMondo. Discover routes, compare travel modes, and explore luxury hotel promotions in \${formattedDestination}\`;
    const seoKeywords = \`travel routes, flights, trains, buses, hotels, \${formattedOrigin} to \${formattedDestination}, travel comparison\`;
    
    document.title = seoTitle;
    document.querySelector('meta[name="description"]').setAttribute('content', seoDescription);
    document.querySelector('meta[name="keywords"]').setAttribute('content', seoKeywords);
    document.querySelector('meta[property="og:title"]').setAttribute('content', seoTitle);
    document.querySelector('meta[property="og:description"]').setAttribute('content', seoDescription);
    document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);
    document.querySelector('meta[name="twitter:title"]').setAttribute('content', seoTitle);
    document.querySelector('meta[name="twitter:description"]').setAttribute('content', seoDescription);
    document.querySelector('link[rel="canonical"]').setAttribute('href', window.location.href);
    
    // Update breadcrumb
    document.getElementById('breadcrumb-current').textContent = \`\${formattedOrigin} to \${formattedDestination}\`;

    document.getElementById('route-heading').textContent = \`\${formattedOrigin} to \${formattedDestination}\`;
    document.getElementById('route-description').textContent = \`Discover and compare the fastest, cheapest and most convenient travel modes between \${formattedOrigin} and \${formattedDestination}, including flights, trains, buses and ferries.\`;

    // Pre-fill search inputs
    document.getElementById('origin-input').value = formattedOrigin;
    document.getElementById('destination-input').value = formattedDestination;

    document.getElementById('deal-title').textContent = \`Best Hotel Deals in \${formattedDestination}\`;
    document.getElementById('deal-subtitle').textContent = \`Explore top-rated luxury hotel deals and discounts near \${formattedDestination}. Stay in comfort, close to key locations including beaches, hospitals, and city centers.\`;

    // Generate travel mode cards
    function generateTravelModes() {
      const travelModes = [
        {
          icon: '✈️',
          name: 'Flight',
          description: 'Fastest option for long distances',
          pros: ['Fastest', 'Comfortable', 'Direct routes'],
          cons: ['Most expensive', 'Airport transfers', 'Baggage limits'],
          estimatedTime: '2-8 hours',
          estimatedCost: '$200-800'
        },
        {
          icon: '🚄',
          name: 'Train',
          description: 'Scenic and comfortable for medium distances',
          pros: ['Scenic views', 'Comfortable', 'City center to city center'],
          cons: ['Slower than flight', 'Limited routes', 'Can be expensive'],
          estimatedTime: '4-12 hours',
          estimatedCost: '$50-300'
        },
        {
          icon: '🚌',
          name: 'Bus',
          description: 'Budget-friendly option for shorter distances',
          pros: ['Cheapest', 'Frequent departures', 'Flexible'],
          cons: ['Slowest', 'Less comfortable', 'Limited amenities'],
          estimatedTime: '6-24 hours',
          estimatedCost: '$20-100'
        },
        {
          icon: '🚗',
          name: 'Car',
          description: 'Flexible and convenient for road trips',
          pros: ['Flexible schedule', 'Scenic routes', 'No baggage limits'],
          cons: ['Long driving time', 'Fuel costs', 'Parking fees'],
          estimatedTime: '8-20 hours',
          estimatedCost: '$100-400'
        }
      ];

      const container = document.getElementById('travel-modes-container');
      container.innerHTML = '';

      travelModes.forEach(mode => {
        const card = document.createElement('div');
        card.className = 'travel-mode-card';
        card.innerHTML = \`
          <div class="mode-header">
            <div class="mode-icon">\${mode.icon}</div>
            <h3>\${mode.name}</h3>
          </div>
          <p class="mode-description">\${mode.description}</p>
          <div class="mode-details">
            <div class="detail-item">
              <span class="label">Time:</span>
              <span class="value">\${mode.estimatedTime}</span>
            </div>
            <div class="detail-item">
              <span class="label">Cost:</span>
              <span class="value">\${mode.estimatedCost}</span>
            </div>
          </div>
          <div class="mode-pros-cons">
            <div class="pros">
              <h4>Pros:</h4>
              <ul>
                \${mode.pros.map(pro => \`<li>\${pro}</li>\`).join('')}
              </ul>
            </div>
            <div class="cons">
              <h4>Cons:</h4>
              <ul>
                \${mode.cons.map(con => \`<li>\${con}</li>\`).join('')}
              </ul>
            </div>
          </div>
          <button class="compare-mode-btn" onclick="compareMode('\${mode.name.toLowerCase()}')">
            Compare \${mode.name}
          </button>
        \`;
        container.appendChild(card);
      });
    }

    // Function to handle travel mode comparison
    function compareMode(mode) {
      const origin = document.getElementById('origin-input').value;
      const destination = document.getElementById('destination-input').value;
      
      // Open Rome2Rio with specific mode filter
      const rome2rioUrl = \`https://www.rome2rio.com/map/\${origin}/\${destination}?mode=\${mode}\`;
      window.open(rome2rioUrl, '_blank');
    }

    // Load hotels
    fetch(jsonUrl)
      .then(response => {
        if (!response.ok) throw new Error("Hotel data not found");
        return response.json();
      })
      .then(hotels => {
        const container = document.getElementById('hotel-container');
        container.innerHTML = '';
        hotels.slice(0, 4).forEach(hotel => {
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
      })
      .catch(error => {
        console.warn("Hotel fetch error:", error);
        const container = document.getElementById('hotel-container');
        container.innerHTML = '<p>No hotel data available for this destination.</p>';
      });

    // Set hero background
    const heroSection = document.querySelector('.hero');
    heroSection.style.backgroundImage = \`url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1748&&auto=format&fit=crop&w=1600&q=80')\`;

    // Generate travel modes on page load
    generateTravelModes();

    // Enhanced compare button functionality
    document.getElementById('compareBtn').addEventListener('click', function () {
      const origin = document.getElementById('origin-input').value.trim();
      const destination = document.getElementById('destination-input').value.trim();
      const rome2rioUrl = \`https://www.rome2rio.com/map/\${origin}/\${destination}\`;
      const luxuryUrl = \`https://luxuryescapes.com/us/hotels\`;
      const openAffiliate = document.getElementById('affiliateToggle').checked;

      // Open Rome2Rio in new tab
      window.open(rome2rioUrl, '_blank');

      // If affiliate toggle is checked, redirect current tab to LuxuryEscapes
      if (openAffiliate) {
        setTimeout(() => {
          window.location.href = luxuryUrl;
        }, 1000);
      }
    });

    // Add input change handlers for dynamic URL updates
    document.getElementById('origin-input').addEventListener('change', updateRoute);
    document.getElementById('destination-input').addEventListener('change', updateRoute);

    function updateRoute() {
      const newOrigin = document.getElementById('origin-input').value.trim();
      const newDestination = document.getElementById('destination-input').value.trim();
      
      if (newOrigin && newDestination) {
        const newUrl = \`/route/\${newOrigin.toLowerCase().replace(/ /g, '-')}/\${newDestination.toLowerCase().replace(/ /g, '-')}\`;
        window.history.pushState({}, '', newUrl);
        
        // Update page content
        const formattedNewOrigin = formatDestinationName(newOrigin);
        const formattedNewDestination = formatDestinationName(newDestination);
        
        document.getElementById('route-heading').textContent = \`\${formattedNewOrigin} to \${formattedNewDestination}\`;
        document.getElementById('route-description').textContent = \`Discover and compare the fastest, cheapest and most convenient travel modes between \${formattedNewOrigin} and \${formattedNewDestination}, including flights, trains, buses and ferries.\`;
        document.getElementById('breadcrumb-current').textContent = \`\${formattedNewOrigin} to \${formattedNewDestination}\`;
        document.getElementById('deal-title').textContent = \`Best Hotel Deals in \${formattedNewDestination}\`;
      }
    }
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

        // Extract origin and destination from URL path
        function getRouteFromPath() {
            const pathSegments = window.location.pathname.split('/').filter(segment => segment);
            
            // Look for 'route' in the path and get the next two segments
            const routeIndex = pathSegments.indexOf('route');
            if (routeIndex !== -1 && pathSegments.length >= routeIndex + 3) {
                return {
                    origin: pathSegments[routeIndex + 1],
                    destination: pathSegments[routeIndex + 2]
                };
            }
            
            // Fallback to query parameters for backward compatibility
            const params = new URLSearchParams(window.location.search);
            return {
                origin: params.get('origin') || '',
                destination: params.get('destination') || ''
            };
        }

        const { origin, destination } = getRouteFromPath();
        
        // Format both origin and destination names for display
        const formattedOrigin = formatDestinationName(origin);
        const formattedDestination = formatDestinationName(destination);

        const destLower = destination.toLowerCase().replace(/ /g, '_');
        const jsonUrl = \`/data/hotels/\${destLower}.json\`;

        // Update meta tags dynamically
        const seoTitle = \`\${formattedOrigin} to \${formattedDestination} | Compare Travel Modes & Hotel deals\`;
        const seoDescription = \`Compare travel modes from \${formattedOrigin} to \${formattedDestination} in ExploraMondo. Discover routes, compare travel modes, and explore luxury hotel promotions in \${formattedDestination}\`;
        const seoKeywords = \`travel routes, flights, trains, buses, hotels, \${formattedOrigin} to \${formattedDestination}, travel comparison\`;
        
        document.title = seoTitle;
        document.querySelector('meta[name="description"]').setAttribute('content', seoDescription);
        document.querySelector('meta[name="keywords"]').setAttribute('content', seoKeywords);
        document.querySelector('meta[property="og:title"]').setAttribute('content', seoTitle);
        document.querySelector('meta[property="og:description"]').setAttribute('content', seoDescription);
        document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);
        document.querySelector('meta[name="twitter:title"]').setAttribute('content', seoTitle);
        document.querySelector('meta[name="twitter:description"]').setAttribute('content', seoDescription);
        document.querySelector('link[rel="canonical"]').setAttribute('href', window.location.href);
        
        // Update breadcrumb
        document.getElementById('breadcrumb-current').textContent = \`\${formattedOrigin} to \${formattedDestination}\`;

        document.getElementById('route-heading').textContent = \`\${formattedOrigin} to \${formattedDestination}\`;
        document.getElementById('route-description').textContent = \`Discover and compare the fastest, cheapest and most convenient travel modes between \${formattedOrigin} and \${formattedDestination}, including flights, trains, buses and ferries.\`;

        // Pre-fill search inputs
        document.getElementById('origin-input').value = formattedOrigin;
        document.getElementById('destination-input').value = formattedDestination;

        document.getElementById('deal-title').textContent = \`Best Hotel Deals in \${formattedDestination}\`;
        document.getElementById('deal-subtitle').textContent = \`Explore top-rated luxury hotel deals and discounts near \${formattedDestination}. Stay in comfort, close to key locations including beaches, hospitals, and city centers.\`;

        // Generate travel mode cards from route-specific data
        function generateTravelModes() {
          const routeKey = \`\${origin.toLowerCase()}_\${destination.toLowerCase()}\`;
          const routeDataUrl = \`/data/routes/\${routeKey}.json\`;
          
          fetch(routeDataUrl)
            .then(response => {
              if (!response.ok) {
                throw new Error('Route data not found');
              }
              return response.json();
            })
            .then(routeData => {
              const container = document.getElementById('travel-modes-container');
              if (!container) return;
              
              container.innerHTML = '';
              
              if (routeData.modes && routeData.modes.length > 0) {
                routeData.modes.forEach(mode => {
                  const card = document.createElement('div');
                  card.className = 'travel-mode-card';
                  card.innerHTML = \`
                    <div class="mode-icon">\${mode.icon || '🚗'}</div>
                    <div class="mode-info">
                      <h3>\${mode.name}</h3>
                      <p class="mode-duration">\${mode.duration}</p>
                      <p class="mode-price">\${mode.price}</p>
                      <p class="mode-description">\${mode.description}</p>
                    </div>
                  \`;
                  container.appendChild(card);
                });
              } else {
                container.innerHTML = '<p>No route data available for this journey.</p>';
              }
            })
            .catch(error => {
              console.warn("Route data fetch error:", error);
              const container = document.getElementById('travel-modes-container');
              if (container) {
                container.innerHTML = '<p>No route data available for this journey.</p>';
              }
            });
        }

        // Load hotels when page loads
        document.addEventListener('DOMContentLoaded', function() {
          generateTravelModes();
          
          fetch(jsonUrl)
            .then(response => {
              if (!response.ok) {
                throw new Error('Hotel data not found');
              }
              return response.json();
            })
            .then(hotels => {
              const container = document.getElementById('hotel-container');
              container.innerHTML = '';
              hotels.slice(0, 4).forEach(hotel => {
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
            })
            .catch(error => {
              console.warn("Hotel fetch error:", error);
              const container = document.getElementById('hotel-container');
              container.innerHTML = '<p>No hotel data available for this destination.</p>';
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
    console.error('Error in route function:', error);
    return {
      statusCode: 500,
      body: 'Internal server error'
    };
  }
}; 