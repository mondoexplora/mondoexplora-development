const fs = require('fs');
const path = require('path');

// Regional mapping for countries
const REGIONAL_MAPPING = {
  'South East Asia': [
    'Thailand', 'Vietnam', 'Indonesia', 'Philippines', 'Malaysia', 'Singapore', 
    'Cambodia', 'Laos', 'Myanmar', 'Brunei', 'East Timor'
  ],
  'Japan & South Korea': [
    'Japan', 'South Korea', 'North Korea'
  ],
  'US, Canada & Mexico': [
    'United States', 'Canada', 'Mexico', 'USA'
  ],
  'Australia & New Zealand': [
    'Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Solomon Islands', 'Vanuatu'
  ],
  'Europe': [
    'France', 'Italy', 'Spain', 'Germany', 'United Kingdom', 'Netherlands', 'Belgium', 
    'Switzerland', 'Austria', 'Portugal', 'Greece', 'Turkey', 'Poland', 'Czech Republic',
    'Hungary', 'Croatia', 'Slovenia', 'Slovakia', 'Romania', 'Bulgaria', 'Ireland',
    'Denmark', 'Sweden', 'Norway', 'Finland', 'Iceland', 'Estonia', 'Latvia', 'Lithuania',
    'Malta', 'Cyprus', 'Luxembourg', 'Monaco', 'Liechtenstein', 'Andorra', 'San Marino',
    'Vatican City', 'Albania', 'Bosnia and Herzegovina', 'Montenegro', 'Serbia',
    'North Macedonia', 'Moldova', 'Belarus', 'Ukraine', 'Russia'
  ],
  'Latin America': [
    'Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Uruguay', 'Paraguay', 'Bolivia', 
    'Ecuador', 'Venezuela', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Nicaragua', 
    'El Salvador', 'Dominican Republic', 'Cuba', 'Jamaica', 'Trinidad and Tobago', 'Barbados'
  ]
};

async function analyzeData() {
  console.log('🔍 Analyzing hotel and destination data...\n');
  
  const hotelsDir = path.join(__dirname, '../data/hotels');
  const destinationsDir = path.join(__dirname, '../data/en/destination');
  
  // Read all hotel files
  const hotelFiles = fs.readdirSync(hotelsDir).filter(file => file.endsWith('.json'));
  console.log(`📊 Found ${hotelFiles.length} hotel files`);
  
  // Read all destination files
  const destinationFiles = fs.readdirSync(destinationsDir).filter(file => file.endsWith('.json'));
  console.log(`🌍 Found ${destinationFiles.length} destination files\n`);
  
  // Analyze hotels by country
  const countryHotelCounts = {};
  const destinationHotelCounts = {};
  
  for (const file of hotelFiles) {
    try {
      const filePath = path.join(hotelsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const hotels = JSON.parse(content);
      
      if (Array.isArray(hotels) && hotels.length > 0) {
        const firstHotel = hotels[0];
        const country = firstHotel.offer_country_name;
        const destination = firstHotel.location_heading;
        
        if (!countryHotelCounts[country]) {
          countryHotelCounts[country] = 0;
        }
        countryHotelCounts[country] += hotels.length;
        
        if (!destinationHotelCounts[destination]) {
          destinationHotelCounts[destination] = 0;
        }
        destinationHotelCounts[destination] += hotels.length;
      }
    } catch (error) {
      console.log(`⚠️  Error reading ${file}: ${error.message}`);
    }
  }
  
  // Group countries by region
  const regionalData = {};
  
  for (const [region, countries] of Object.entries(REGIONAL_MAPPING)) {
    regionalData[region] = {
      countries: {},
      totalHotels: 0
    };
    
    for (const country of countries) {
      if (countryHotelCounts[country]) {
        regionalData[region].countries[country] = {
          hotelCount: countryHotelCounts[country],
          destinations: {}
        };
        regionalData[region].totalHotels += countryHotelCounts[country];
        
        // Find destinations for this country
        for (const [dest, count] of Object.entries(destinationHotelCounts)) {
          // Check if this destination belongs to this country
          // We'll need to cross-reference with destination files
          try {
            const destFile = dest.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const destPath = path.join(destinationsDir, `${destFile}.json`);
            if (fs.existsSync(destPath)) {
              const destContent = fs.readFileSync(destPath, 'utf8');
              const destData = JSON.parse(destContent);
              if (destData.country === country) {
                regionalData[region].countries[country].destinations[dest] = count;
              }
            }
          } catch (error) {
            // Skip if can't read destination file
          }
        }
        
        // Sort destinations by hotel count
        const sortedDests = Object.entries(regionalData[region].countries[country].destinations)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10); // Top 10 destinations
        
        regionalData[region].countries[country].destinations = Object.fromEntries(sortedDests);
      }
    }
    
    // Sort countries by hotel count
    const sortedCountries = Object.entries(regionalData[region].countries)
      .sort(([,a], [,b]) => b.hotelCount - a.hotelCount);
    
    regionalData[region].countries = Object.fromEntries(sortedCountries);
  }
  
  // Generate summary
  console.log('📈 REGIONAL ANALYSIS:\n');
  
  for (const [region, data] of Object.entries(regionalData)) {
    console.log(`🗺️  ${region} (${data.totalHotels} total hotels):`);
    
    const topCountries = Object.entries(data.countries).slice(0, 4);
    for (const [country, countryData] of topCountries) {
      console.log(`   📍 ${country}: ${countryData.hotelCount} hotels`);
      
      const topDests = Object.entries(countryData.destinations).slice(0, 5);
      for (const [dest, count] of topDests) {
        console.log(`      • ${dest}: ${count} hotels`);
      }
    }
    console.log('');
  }
  
  // Save analysis results
  const outputPath = path.join(__dirname, '../data/regional-analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify(regionalData, null, 2));
  console.log(`💾 Analysis saved to: ${outputPath}`);
  
  return regionalData;
}

// Run analysis
analyzeData().catch(console.error);
