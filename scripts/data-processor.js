const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');
const { validateHotelData, isOfferExpired } = require('./utils/validation');
const { generateLanguageFiles, generateCountryFiles, generateRouteFiles } = require('./utils/file-manager');
const { convertDestinationsCSV } = require('./utils/csv-to-json');

// Configuration
const CSV_URL = 'https://files.channable.com/nWzb4bDZZozNdXZ-kzF9IQ==.csv';
const DATA_DIR = path.join(__dirname, '..', 'data');
const LANGUAGES = ['en'];

// Required fields for a valid hotel
const REQUIRED_FIELDS = [
  'vendor_name',
  'offer_country_name', 
  'location_heading',
  'offer_opportunity_name',
  'title',
  'description',
  'price',
  'percentage_discount',
  'end_date_utc',
  'link',
  'image_link',
  'image_two',
  'image_three',
  'offer_country_code_alpha_2'
];

async function fetchCSVData() {
  try {
    console.log('📥 Fetching CSV data from:', CSV_URL);
    const response = await axios.get(CSV_URL, {
      timeout: 30000, // 30 second timeout
      validateStatus: (status) => status === 200
    });
    
    if (!response.data || response.data.length === 0) {
      throw new Error('CSV response is empty');
    }
    
    console.log(`✅ CSV fetched successfully (${response.data.length} characters)`);
    // Log first few lines to debug
    const firstLines = response.data.split('\n').slice(0, 3).join('\n');
    console.log('📄 First few lines of CSV:', firstLines);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching CSV:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data).substring(0, 200)}`);
    }
    throw error;
  }
}

function parseCSVData(csvData) {
  return new Promise((resolve, reject) => {
    const hotels = [];
    let totalRows = 0;
    let validRows = 0;
    let expiredRows = 0;
    const stream = require('stream');
    const readable = stream.Readable.from(csvData);
    
    readable
      .pipe(csv())
      .on('data', (row) => {
        totalRows++;
        // Validate required fields
        if (validateHotelData(row, REQUIRED_FIELDS)) {
          validRows++;
          // Check if offer is expired
          if (!isOfferExpired(row.end_date_utc)) {
            hotels.push({
              vendor_name: row.vendor_name,
              country: row.offer_country_name,
              country_code: row.offer_country_code_alpha_2,
              city: row.location_heading,
              title: row.title,
              description: row.description,
              price: parseFloat(row.price),
              original_price: calculateOriginalPrice(row.price, row.percentage_discount),
              discount_percentage: parseInt(row.percentage_discount),
              link: row.link,
              hero_image: row.image_link,
              image_two: row.image_two,
              image_three: row.image_three,
              end_date: row.end_date_utc,
              deal_tier: row.deal_tier,
              min_duration: parseInt(row.min_duration) || 1
            });
          } else {
            expiredRows++;
          }
        }
      })
      .on('end', () => {
        console.log(`📊 CSV Parsing Statistics:`);
        console.log(`   • Total rows in CSV: ${totalRows}`);
        console.log(`   • Valid rows (passed validation): ${validRows}`);
        console.log(`   • Expired offers (filtered out): ${expiredRows}`);
        console.log(`   • Active offers (to process): ${hotels.length}`);
        console.log(`✅ Parsed ${hotels.length} valid hotels from CSV`);
        resolve(hotels);
      })
      .on('error', (error) => {
        console.error('❌ CSV parsing error:', error);
        reject(error);
      });
  });
}



function calculateOriginalPrice(price, discount) {
  const currentPrice = parseFloat(price);
  const discountPercent = parseInt(discount);
  if (discountPercent > 0) {
    return Math.round(currentPrice / (1 - discountPercent / 100));
  }
  return currentPrice;
}

async function groupHotelsByDestination(hotels) {
  const destinations = {};
  
  hotels.forEach(hotel => {
    const key = `${hotel.country_code}-${hotel.city}`;
    if (!destinations[key]) {
      destinations[key] = {
        city: hotel.city,
        country: hotel.country,
        country_code: hotel.country_code,
        hotels: []
      };
    }
    destinations[key].hotels.push(hotel);
  });
  
  return destinations;
}

async function main() {
  try {
    console.log('🚀 Starting data processing...');
    
    // 1. Fetch CSV data
    const csvData = await fetchCSVData();
    
    // 2. Parse and validate data
    const hotels = await parseCSVData(csvData);
    
    // 3. Group hotels by destination
    const destinations = await groupHotelsByDestination(hotels);
    
    // 4. Log destination statistics
    console.log('\n📊 Destination Statistics:');
    const destinationStats = Object.entries(destinations).map(([key, dest]) => ({
      city: dest.city,
      country: dest.country,
      hotelCount: dest.hotels.length
    })).sort((a, b) => b.hotelCount - a.hotelCount);
    
    destinationStats.slice(0, 10).forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.city}, ${stat.country}: ${stat.hotelCount} hotel deals`);
    });
    
    // Log country statistics
    console.log('\n🌍 Country Statistics:');
    const countryStats = {};
    Object.values(destinations).forEach(dest => {
      if (!countryStats[dest.country]) {
        countryStats[dest.country] = { totalHotels: 0, destinations: 0 };
      }
      countryStats[dest.country].totalHotels += dest.hotels.length;
      countryStats[dest.country].destinations += 1;
    });
    
    Object.entries(countryStats)
      .sort((a, b) => b[1].totalHotels - a[1].totalHotels)
      .slice(0, 10)
      .forEach(([country, stats], index) => {
        console.log(`${index + 1}. ${country}: ${stats.totalHotels} hotel deals across ${stats.destinations} destinations`);
      });
    
    // 5. Convert CSV destinations to JSON
    console.log('🔄 Converting destinations CSV to JSON...');
    await convertDestinationsCSV();
    console.log('✅ Destinations CSV conversion completed');
    
    // 6. Generate JSON files for each language
    await generateLanguageFiles(destinations, LANGUAGES, DATA_DIR);
    
    // Calculate statistics for email report
    const totalHotels = hotels.length;
    const totalDestinations = Object.keys(destinations).length;
    const totalCountries = Object.keys(countryStats).length;
    const totalValue = hotels.reduce((sum, h) => sum + h.price, 0);
    const avgPrice = Math.round(totalValue / totalHotels);
    
    // Count JSON files created
    const fs = require('fs');
    const destinationFiles = fs.readdirSync(path.join(DATA_DIR, 'en', 'destination')).filter(f => f.endsWith('.json')).length;
    const countryFiles = fs.readdirSync(path.join(DATA_DIR, 'en', 'country')).filter(f => f.endsWith('.json')).length;
    const totalJsonFiles = destinationFiles + countryFiles + 1; // +1 for homepage-data.json
    
    console.log('✅ Data processing completed successfully!');
    console.log(`📊 Processed ${totalHotels} hotel deals across ${totalDestinations} destinations`);
    console.log(`💰 Total deals value: $${totalValue.toLocaleString()}`);
    console.log(`🎯 Average deal price: $${avgPrice}`);
    console.log(`📁 Created ${totalJsonFiles} JSON files (${destinationFiles} destinations + ${countryFiles} countries + 1 homepage)`);
    
    // Output statistics as JSON for GitHub Actions to capture
    const stats = {
      success: true,
      timestamp: new Date().toISOString(),
      totalHotels,
      totalDestinations,
      totalCountries,
      totalJsonFiles,
      destinationFiles,
      countryFiles,
      totalValue,
      avgPrice,
      topDestinations: destinationStats.slice(0, 5).map(s => `${s.city}, ${s.country} (${s.hotelCount} hotels)`)
    };
    
    // Write stats to file for GitHub Actions
    fs.writeFileSync(
      path.join(__dirname, '..', 'data-update-stats.json'),
      JSON.stringify(stats, null, 2)
    );
    
    return stats;
    
  } catch (error) {
    console.error('❌ Data processing failed:', error);
    
    // Write error stats
    const fs = require('fs');
    const errorStats = {
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };
    
    fs.writeFileSync(
      path.join(__dirname, '..', 'data-update-stats.json'),
      JSON.stringify(errorStats, null, 2)
    );
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main }; 