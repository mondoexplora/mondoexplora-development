const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // Extract country name from the URL path
    const pathSegments = event.path.split('/').filter(segment => segment);
    const countryIndex = pathSegments.indexOf('country');
    const countryName = pathSegments[countryIndex + 1];

    if (!countryName) {
      return {
        statusCode: 404,
        body: 'Country not found'
      };
    }

    // Load country data
    const countryFilePath = `/data/countries/${countryName}.json`;
    let countryData;
    
    try {
      if (fs.existsSync(countryFilePath)) {
        countryData = JSON.parse(fs.readFileSync(countryFilePath, 'utf8'));
      } else {
        // Fallback to default data
        countryData = {
          "name": countryName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          "stats": {"routes": 10, "cities": 5, "providers": 20},
          "popular_routes": [],
          "major_cities": [],
          "travel_tips": {}
        };
      }
    } catch (error) {
      console.error('Error loading country data:', error);
      // Fallback to default data
      countryData = {
        "name": countryName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        "stats": {"routes": 10, "cities": 5, "providers": 20},
        "popular_routes": [],
        "major_cities": [],
        "travel_tips": {}
      };
    }

    // Embedded country template
    const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title id="pageTitle">Travel to [Country] - Best Routes, Destinations & Transport Guide</title>
    <meta name="description" id="pageDescription" content="Discover the best travel routes in [Country]. Find flights, trains, buses and ferries between major cities. Plan your perfect trip with our comprehensive transport guide.">
    
    <!-- SEO Meta Tags -->
    <meta name="keywords" id="pageKeywords" content="travel [country], [country] transport, [country] routes, flights [country], trains [country], buses [country], [country] travel guide">
    <meta name="author" content="Travel Routes Guide">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" id="ogUrl" content="https://travelroutes.com/country/[country]">
    <meta property="og:title" id="ogTitle" content="Travel to [Country] - Complete Transport Guide">
    <meta property="og:description" id="ogDescription" content="Plan your trip to [Country] with our comprehensive transport guide. Find the best routes between cities.">
    <meta property="og:image" id="ogImage" content="https://travelroutes.com/images/countries/[country].jpg">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" id="twitterUrl" content="https://travelroutes.com/country/[country]">
    <meta property="twitter:title" id="twitterTitle" content="Travel to [Country] - Complete Transport Guide">
    <meta property="twitter:description" id="twitterDescription" content="Plan your trip to [Country] with our comprehensive transport guide. Find the best routes between cities.">
    <meta property="twitter:image" id="twitterImage" content="https://travelroutes.com/images/countries/[country].jpg">
    
    <!-- Schema.org structured data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "TravelGuide",
        "name": "Travel Guide to [Country]",
        "description": "Complete travel guide for [Country] with transport information, routes, and travel tips",
        "url": "https://travelroutes.com/country/[country]",
        "image": "https://travelroutes.com/images/countries/[country].jpg",
        "author": {
            "@type": "Organization",
            "name": "Travel Routes Guide"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Travel Routes Guide",
            "logo": {
                "@type": "ImageObject",
                "url": "https://travelroutes.com/logo.png"
            }
        },
        "mainEntity": {
            "@type": "Country",
            "name": "[Country]"
        }
    }
    </script>
    
    <link rel="stylesheet" href="/css/country.css">
    <link rel="canonical" id="canonicalUrl" href="https://travelroutes.com/country/[country]">
</head>
<body>
    <!-- Header - REMOVED -->

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="logo-overlay"><span>EXPLORA</span><span>MONDO</span></div>
        <div class="page-header">
            <h1 id="country-title">Discover <span class="country-name">[Country]</span></h1>
            <p id="country-description">Discover amazing accommodation deals and luxury hotels in <span class="country-name">[Country]</span>. Book with confidence and enjoy exclusive discounts.</p>
        </div>
    </section>

    <!-- Main Content Section -->
    <section class="main-content" role="main">
        <div class="container">
            <!-- Deals of the Week Section -->
            <div class="deals-section">
                <h2 class="section-title">Deals of the Week</h2>
                <div class="deals-grid" id="dealsGrid">
                    <!-- Hotel deals will be loaded here -->
                </div>
                <!-- Pagination -->
                <div class="pagination" id="pagination">
                    <!-- Pagination controls will be added here -->
                </div>
            </div>

            <!-- Transport Modes Section -->
            <div class="transport-modes">
                <h2>Transport Options in <span class="country-name">[Country]</span></h2>
                <div class="modes-grid">
                    <div class="mode-card">
                        <div class="mode-icon">✈️</div>
                        <h3>Flights</h3>
                        <p>Domestic and international flights with major airlines</p>
                        <ul class="mode-features">
                            <li>Multiple daily flights</li>
                            <li>Budget and premium options</li>
                            <li>Online booking available</li>
                        </ul>
                    </div>
                    <div class="mode-card">
                        <div class="mode-icon">🚄</div>
                        <h3>Trains</h3>
                        <p>Comfortable rail travel between major cities</p>
                        <ul class="mode-features">
                            <li>High-speed and regional trains</li>
                            <li>Scenic routes available</li>
                            <li>Advance booking recommended</li>
                        </ul>
                    </div>
                    <div class="mode-card">
                        <div class="mode-icon">🚌</div>
                        <h3>Buses</h3>
                        <p>Affordable bus services across the country</p>
                        <ul class="mode-features">
                            <li>Regular departures</li>
                            <li>VIP and standard classes</li>
                            <li>Online ticket booking</li>
                        </ul>
                    </div>
                    <div class="mode-card">
                        <div class="mode-icon">⛴️</div>
                        <h3>Ferries</h3>
                        <p>Island hopping and coastal connections</p>
                        <ul class="mode-features">
                            <li>Island destinations</li>
                            <li>Scenic sea routes</li>
                            <li>Weather dependent</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Travel Tips Section -->
    <section class="travel-tips">
        <div class="container">
            <h2>Travel Tips for <span class="country-name">[Country]</span></h2>
            <div class="tips-grid">
                <div class="tip-card">
                    <h3>Best Time to Visit</h3>
                    <p id="bestTime">[Country-specific best time information]</p>
                </div>
                <div class="tip-card">
                    <h3>Transportation Tips</h3>
                    <p id="transportTips">[Country-specific transport tips]</p>
                </div>
                <div class="tip-card">
                    <h3>Booking Advice</h3>
                    <p id="bookingAdvice">[Country-specific booking advice]</p>
                </div>
                <div class="tip-card">
                    <h3>Local Customs</h3>
                    <p id="localCustoms">[Country-specific customs information]</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="container">
            <h2>Ready to Explore <span class="country-name">[Country]</span>?</h2>
            <p>Find the perfect route and start planning your adventure today</p>
            <div class="cta-buttons">
                <a href="#quick-search" class="cta-btn primary">Search Routes</a>
                <a href="/destination/[country]" class="cta-btn secondary">View Destinations</a>
            </div>
        </div>
    </section>

    <!-- Footer -->
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
            <h4>Countries</h4>
            <ul>
                <li><a href="/country/thailand">Thailand</a></li>
                <li><a href="/country/australia">Australia</a></li>
                <li><a href="/country/japan">Japan</a></li>
                <li><a href="/country/italy">Italy</a></li>
                <li><a href="/country/spain">Spain</a></li>
                <li><a href="/country/france">France</a></li>
                <li><a href="/country/germany">Germany</a></li>
                <li><a href="/country/uk">United Kingdom</a></li>
                <li><a href="/country/usa">United States</a></li>
                <li><a href="/country/canada">Canada</a></li>
            </ul>
        </nav>
        <nav class="footer-column">
            <h4>Top Routes in Thailand</h4>
            <ul>
                <li><a href="/route/bangkok/phuket">Bangkok → Phuket</a></li>
                <li><a href="/route/bangkok/chiang_mai">Bangkok → Chiang Mai</a></li>
                <li><a href="/route/phuket/krabi">Phuket → Krabi</a></li>
                <li><a href="/route/koh_tao/koh_phi_phi">Koh Tao → Koh Phi Phi</a></li>
                <li><a href="/route/pattaya/koh_samui">Pattaya → Koh Samui</a></li>
                <li><a href="/route/bangkok/krabi">Bangkok → Krabi</a></li>
                <li><a href="/route/chiang_mai/chiang_rai">Chiang Mai → Chiang Rai</a></li>
                <li><a href="/route/phuket/koh_samui">Phuket → Koh Samui</a></li>
                <li><a href="/route/bangkok/pattaya">Bangkok → Pattaya</a></li>
                <li><a href="/route/krabi/koh_phi_phi">Krabi → Koh Phi Phi</a></li>
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
        // Get country from URL
        const pathParts = window.location.pathname.split('/');
        const country = pathParts[pathParts.length - 1];
        
        // Update all dynamic content
        document.addEventListener('DOMContentLoaded', function() {
            updatePageContent(country);
            loadCountryData(country);
            loadDestinationLinks();
        });

        function updatePageContent(country) {
            const countryName = country.charAt(0).toUpperCase() + country.slice(1).replace(/_/g, ' ');
            
            // Update titles and meta tags
            document.getElementById('pageTitle').textContent = \`Travel to \${countryName} - Best Routes, Destinations & Transport Guide\`;
            document.getElementById('pageDescription').textContent = \`Discover the best travel routes in \${countryName}. Find flights, trains, buses and ferries between major cities. Plan your perfect trip with our comprehensive transport guide.\`;
            document.getElementById('pageKeywords').textContent = \`travel \${countryName}, \${countryName} transport, \${countryName} routes, flights \${countryName}, trains \${countryName}, buses \${countryName}, \${countryName} travel guide\`;
            
            // Update Open Graph tags
            document.getElementById('ogUrl').content = \`https://travelroutes.com/country/\${country}\`;
            document.getElementById('ogTitle').content = \`Travel to \${countryName} - Complete Transport Guide\`;
            document.getElementById('ogDescription').content = \`Plan your trip to \${countryName} with our comprehensive transport guide. Find the best routes between cities.\`;
            document.getElementById('ogImage').content = \`https://travelroutes.com/images/countries/\${country}.jpg\`;
            
            // Update Twitter tags
            document.getElementById('twitterUrl').content = \`https://travelroutes.com/country/\${country}\`;
            document.getElementById('twitterTitle').content = \`Travel to \${countryName} - Complete Transport Guide\`;
            document.getElementById('twitterDescription').content = \`Plan your trip to \${countryName} with our comprehensive transport guide. Find the best routes between cities.\`;
            document.getElementById('twitterImage').content = \`https://travelroutes.com/images/countries/\${country}.jpg\`;
            
            // Update canonical URL
            document.getElementById('canonicalUrl').href = \`https://travelroutes.com/country/\${country}\`;
            
            // Update page content
            document.querySelectorAll('.country-name').forEach(el => el.textContent = countryName);
            document.getElementById('country-title').innerHTML = \`Discover <span class="country-name">\${countryName}</span>\`;
            document.getElementById('country-description').innerHTML = \`Discover amazing accommodation deals and luxury hotels in <span class="country-name">\${countryName}</span>. Book with confidence and enjoy exclusive discounts.\`;
        }

        function loadCountryData(country) {
            // Load country-specific data
            fetch(\`/data/countries/\${country}.json\`)
                .then(response => response.json())
                .then(data => {
                    loadAccommodationDeals(country);
                    updateTravelTips(data.travel_tips);
                })
                .catch(error => {
                    console.log('Using default country data');
                    loadDefaultCountryData(country);
                });
        }

        function updateCountryStats(data) {
            document.getElementById('routesCount').textContent = data.stats?.routes || 0;
            document.getElementById('citiesCount').textContent = data.stats?.cities || 0;
            document.getElementById('providersCount').textContent = data.stats?.providers || 0;
        }

        function loadPopularRoutes(routes) {
            const routesGrid = document.getElementById('routesGrid');
            routesGrid.innerHTML = '';
            
            // Load routes from the routes data files
            const popularRoutes = [
                { origin: 'bangkok', destination: 'phuket' },
                { origin: 'bangkok', destination: 'chiang_mai' },
                { origin: 'phuket', destination: 'krabi' },
                { origin: 'koh_tao', destination: 'koh_phi_phi' },
                { origin: 'pattaya', destination: 'koh_samui' },
                { origin: 'bangkok', destination: 'krabi' }
            ];
            
            // Load route data from files
            Promise.all(popularRoutes.map(route => 
                fetch(\`/data/routes/\${route.origin}_\${route.destination}.json\`)
                    .then(response => response.json())
                    .catch(() => null)
            )).then(results => {
                const validRoutes = results.filter(route => route !== null);
                
                validRoutes.forEach((route, index) => {
                    const routeCard = document.createElement('div');
                    routeCard.className = 'route-item';
                    routeCard.innerHTML = \`
                        <div class="route-number">\${index + 1}</div>
                        <div class="route-info">
                            <h3>\${route.origin} → \${route.destination}</h3>
                            <p class="route-distance">\${route.distance || 'Various distances'}</p>
                            <div class="route-modes">
                                \${getTransportModes(route.providers || {})}
                            </div>
                        </div>
                        <div class="route-actions">
                            <a href="/route/\${route.origin}/\${route.destination}" class="route-btn">View</a>
                        </div>
                    \`;
                    routesGrid.appendChild(routeCard);
                });
                
                // If no routes loaded, show default ones
                if (validRoutes.length === 0) {
                    routes.forEach((route, index) => {
                        const routeCard = document.createElement('div');
                        routeCard.className = 'route-item';
                        routeCard.innerHTML = \`
                            <div class="route-number">\${index + 1}</div>
                            <div class="route-info">
                                <h3>\${route.origin} → \${route.destination}</h3>
                                <p class="route-distance">\${route.distance}</p>
                                <div class="route-modes">
                                    \${getTransportModes(route.providers)}
                                </div>
                            </div>
                            <div class="route-actions">
                                <a href="/route/\${route.origin}/\${route.destination}" class="route-btn">View</a>
                            </div>
                        \`;
                        routesGrid.appendChild(routeCard);
                    });
                }
            });
        }

        function getTransportModes(providers) {
            const modes = [];
            if (providers.flight) modes.push('✈️ Flight');
            if (providers.train) modes.push('🚄 Train');
            if (providers.bus) modes.push('🚌 Bus');
            if (providers.ferry) modes.push('⛴️ Ferry');
            return modes.join(' ');
        }

        // Pagination variables
        let currentPage = 1;
        const dealsPerPage = 9;
        let allDeals = [];
        
        // Destination links for popunder
        let destinationLinks = {};
        
        // Load destination links from CSV
        function loadDestinationLinks() {
            fetch('/data/destination_links.csv')
                .then(response => response.text())
                .then(csv => {
                    const lines = csv.split('\\n');
                    // Skip header row
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line) {
                            const [country_code, country_name, geo_type, destination, link] = line.split(',');
                            destinationLinks[destination] = link;
                        }
                    }
                    console.log('Destination links loaded:', destinationLinks);
                })
                .catch(error => {
                    console.log('Could not load destination links CSV:', error);
                });
        }
        
        // Handle destination click - open destination page in new tab and redirect current tab to affiliate
        function handleDestinationClick(destinationName) {
            // Open destination page in new tab
            const destinationUrl = \`/destination/\${destinationName.toLowerCase().replace(/\\s+/g, '_')}\`;
            window.open(destinationUrl, '_blank');
            
            // Redirect current tab to affiliate link after a short delay
            const affiliateUrl = destinationLinks[destinationName];
            if (affiliateUrl) {
                setTimeout(() => {
                    window.location.href = affiliateUrl;
                }, 1000);
            }
        }
        
        function loadAccommodationDeals(country) {
            const dealsGrid = document.getElementById('dealsGrid');
            dealsGrid.innerHTML = '<div class="loading">Loading deals...</div>';
            
            // Load all hotel data for the country
            const countryHotels = [];
            const processedLocations = new Set();
            
            // Get list of hotel files for the country (all 9 destinations)
            const hotelFiles = [
                'bangkok', 'chiang_mai', 'phuket', 'krabi', 'koh_samui', 'pattaya',
                'koh_tao', 'koh_phi_phi', 'chiang_rai', 'kanchanaburi'
            ];
            
            // Load hotel data from all files
            Promise.all(hotelFiles.map(city => 
                fetch(\`/data/hotels/\${city}.json\`)
                    .then(response => response.json())
                    .catch(() => [])
            )).then(results => {
                // Process all hotel data
                results.forEach(hotels => {
                    if (Array.isArray(hotels)) {
                        // Group hotels by location_heading
                        const locationGroups = {};
                        hotels.forEach(hotel => {
                            if (hotel.location_heading) {
                                if (!locationGroups[hotel.location_heading]) {
                                    locationGroups[hotel.location_heading] = [];
                                }
                                locationGroups[hotel.location_heading].push(hotel);
                            }
                        });
                        
                        // Create one entry per location with the best hotel image
                        Object.keys(locationGroups).forEach(location => {
                            if (!processedLocations.has(location)) {
                                processedLocations.add(location);
                                const hotelsInLocation = locationGroups[location];
                                // Use the first hotel's image and data
                                const representativeHotel = hotelsInLocation[0];
                                countryHotels.push({
                                    location: location,
                                    price: representativeHotel.price,
                                    value: representativeHotel.value,
                                    image: representativeHotel.hero_image,
                                    link: representativeHotel.link,
                                    hotelCount: hotelsInLocation.length
                                });
                            }
                        });
                    }
                });
                
                // Sort by hotel count (descending) and store all deals
                allDeals = countryHotels.sort((a, b) => b.hotelCount - a.hotelCount);
                
                // Display first page
                displayDealsPage(1);
                
            }).catch(error => {
                console.log('Error loading accommodation deals:', error);
                // Fallback to default destinations
                loadDefaultDestinations();
            });
        }
        
        // Display deals for a specific page
        function displayDealsPage(page) {
            currentPage = page;
            const startIndex = (page - 1) * dealsPerPage;
            const endIndex = startIndex + dealsPerPage;
            const pageDeals = allDeals.slice(startIndex, endIndex);
            
            const dealsGrid = document.getElementById('dealsGrid');
            dealsGrid.innerHTML = '';
            
            // Create deal cards for current page
            pageDeals.forEach(destination => {
                const dealCard = document.createElement('div');
                dealCard.className = 'deal-card';
                dealCard.innerHTML = \`
                    <div class="deal-image">
                        <img src="\${destination.image}" alt="\${destination.location}">
                        <div class="deal-price-badge">
                            <span class="original-price">$\${destination.value}</span>
                            <span class="discount-price">$\${destination.price}</span>
                        </div>
                    </div>
                    <div class="deal-info">
                        <h3>\${destination.location}</h3>
                        <p class="deal-description">Experience the perfect blend of luxury and comfort in this stunning destination. Discover amazing deals on top-rated accommodations.</p>
                        <p class="deal-subtitle">\${destination.hotelCount} hotels available</p>
                        <div class="deal-overlay">
                            <a href="#" class="view-deal-btn" onclick="handleDestinationClick('\${destination.location}'); return false;">View Deal</a>
                        </div>
                    </div>
                \`;
                
                // Add click handler for destination
                dealCard.addEventListener('click', function(e) {
                    // Don't trigger if clicking on the CTA button (it has its own handler)
                    if (e.target.closest('.view-deal-btn')) {
                        return;
                    }
                    
                    const destinationName = destination.location;
                    handleDestinationClick(destinationName);
                });
                
                dealsGrid.appendChild(dealCard);
            });
            
            updatePagination();
        }
        
        // Update pagination controls
        function updatePagination() {
            const pagination = document.getElementById('pagination');
            const totalPages = Math.ceil(allDeals.length / dealsPerPage);
            
            if (totalPages <= 1) {
                pagination.innerHTML = '';
                return;
            }
            
            let paginationHTML = '<div class="pagination-controls">';
            
            // Previous button
            if (currentPage > 1) {
                paginationHTML += \`<button class="pagination-btn" onclick="displayDealsPage(\${currentPage - 1})">Previous</button>\`;
            }
            
            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (i === currentPage) {
                    paginationHTML += \`<button class="pagination-btn active">\${i}</button>\`;
                } else {
                    paginationHTML += \`<button class="pagination-btn" onclick="displayDealsPage(\${i})">\${i}</button>\`;
                }
            }
            
            // Next button
            if (currentPage < totalPages) {
                paginationHTML += \`<button class="pagination-btn" onclick="displayDealsPage(\${currentPage + 1})">Next</button>\`;
            }
            
            paginationHTML += '</div>';
            pagination.innerHTML = paginationHTML;
        }
        
        function loadDefaultDestinations() {
            const dealsGrid = document.getElementById('dealsGrid');
            dealsGrid.innerHTML = '';
            
            // Try to load at least one hotel image from each city as fallback
            const defaultDestinations = [
                { location: 'Bangkok', price: 89, value: 150, image: '/images/cities/bangkok.jpg' },
                { location: 'Phuket', price: 120, value: 200, image: '/images/cities/phuket.jpg' },
                { location: 'Chiang Mai', price: 75, value: 130, image: '/images/cities/chiang_mai.jpg' },
                { location: 'Krabi', price: 95, value: 160, image: '/images/cities/krabi.jpg' },
                { location: 'Koh Samui', price: 110, value: 180, image: '/images/cities/koh_samui.jpg' },
                { location: 'Pattaya', price: 65, value: 120, image: '/images/cities/pattaya.jpg' },
                { location: 'Koh Tao', price: 85, value: 140, image: '/images/cities/koh_tao.jpg' },
                { location: 'Koh Phi Phi', price: 100, value: 170, image: '/images/cities/koh_phi_phi.jpg' }
            ];
            
            // Try to get real hotel images for fallback
            Promise.all([
                fetch('/data/hotels/bangkok.json').then(r => r.json()).catch(() => []),
                fetch('/data/hotels/phuket.json').then(r => r.json()).catch(() => []),
                fetch('/data/hotels/chiang_mai.json').then(r => r.json()).catch(() => []),
                fetch('/data/hotels/krabi.json').then(r => r.json()).catch(() => []),
                fetch('/data/hotels/koh_samui.json').then(r => r.json()).catch(() => []),
                fetch('/data/hotels/pattaya.json').then(r => r.json()).catch(() => []),
                fetch('/data/hotels/koh_tao.json').then(r => r.json()).catch(() => []),
                fetch('/data/hotels/koh_phi_phi.json').then(r => r.json()).catch(() => [])
            ]).then(results => {
                // Update images with real hotel images if available
                results.forEach((hotels, index) => {
                    if (Array.isArray(hotels) && hotels.length > 0 && hotels[0].hero_image) {
                        defaultDestinations[index].image = hotels[0].hero_image;
                    }
                });
                
                // Create deal cards with updated images
                defaultDestinations.forEach(destination => {
                    const dealCard = document.createElement('div');
                    dealCard.className = 'deal-card';
                    dealCard.innerHTML = \`
                        <div class="deal-image">
                            <img src="\${destination.image}" alt="\${destination.location}">
                            <div class="deal-price-badge">
                                <span class="original-price">$\${destination.value}</span>
                                <span class="discount-price">$\${destination.price}</span>
                            </div>
                        </div>
                        <div class="deal-info">
                            <h3>\${destination.location}</h3>
                            <p class="deal-description">Experience the perfect blend of luxury and comfort in this stunning destination. Discover amazing deals on top-rated accommodations.</p>
                            <p class="deal-subtitle">Multiple hotels available</p>
                            <div class="deal-overlay">
                                <a href="#" class="view-deal-btn" onclick="handleDestinationClick('\${destination.location}'); return false;">View Deal</a>
                            </div>
                        </div>
                    \`;
                    
                    // Add click handler for destination
                    dealCard.addEventListener('click', function(e) {
                        // Don't trigger if clicking on the CTA button (it has its own handler)
                        if (e.target.closest('.view-deal-btn')) {
                            return;
                        }
                        
                        const destinationName = destination.location;
                        handleDestinationClick(destinationName);
                    });
                    
                    dealsGrid.appendChild(dealCard);
                });
            }).catch(() => {
                // If all fails, use default images
                defaultDestinations.forEach(destination => {
                    const dealCard = document.createElement('div');
                    dealCard.className = 'deal-card';
                    dealCard.innerHTML = \`
                        <div class="deal-image">
                            <img src="\${destination.image}" alt="\${destination.location}">
                            <div class="deal-price-badge">
                                <span class="original-price">$\${destination.value}</span>
                                <span class="discount-price">$\${destination.price}</span>
                            </div>
                        </div>
                        <div class="deal-info">
                            <h3>\${destination.location}</h3>
                            <p class="deal-description">Experience the perfect blend of luxury and comfort in this stunning destination. Discover amazing deals on top-rated accommodations.</p>
                            <p class="deal-subtitle">Multiple hotels available</p>
                            <div class="deal-overlay">
                                <a href="#" class="view-deal-btn" onclick="handleDestinationClick('\${destination.location}'); return false;">View Deal</a>
                            </div>
                        </div>
                    \`;
                    
                    // Add click handler for destination
                    dealCard.addEventListener('click', function(e) {
                        // Don't trigger if clicking on the CTA button (it has its own handler)
                        if (e.target.closest('.view-deal-btn')) {
                            return;
                        }
                        
                        const destinationName = destination.location;
                        handleDestinationClick(destinationName);
                    });
                    
                    dealsGrid.appendChild(dealCard);
                });
            });
        }

        function updateTravelTips(tips) {
            if (tips.best_time) document.getElementById('bestTime').textContent = tips.best_time;
            if (tips.transport) document.getElementById('transportTips').textContent = tips.transport;
            if (tips.booking) document.getElementById('bookingAdvice').textContent = tips.booking;
            if (tips.customs) document.getElementById('localCustoms').textContent = tips.customs;
        }

        function loadDefaultCountryData(country) {
            // Default data structure
            const defaultData = {
                travel_tips: {
                    best_time: 'Spring and Fall offer the best weather for travel',
                    transport: 'Book transport in advance during peak season',
                    booking: 'Use official websites for the best prices',
                    customs: 'Respect local customs and dress appropriately'
                }
            };
            
            loadDefaultDestinations();
            updateTravelTips(defaultData.travel_tips);
        }
    </script>
</body>
</html>`;

    // Inject country data
    const scriptData = `
    <script>
        window.countryData = ${JSON.stringify(countryData)};
    </script>
    `;

    // Insert script before closing body tag
    template = template.replace('</body>', `${scriptData}</body>`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600'
      },
      body: template
    };

  } catch (error) {
    console.error('Error in country function:', error);
    return {
      statusCode: 500,
      body: 'Internal server error'
    };
  }
}; 