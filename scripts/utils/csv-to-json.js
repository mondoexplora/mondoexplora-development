const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');

/**
 * Converts LE_Destinations.csv to JSON for easy lookup
 */
async function convertDestinationsCSV() {
  const csvPath = path.join(process.cwd(), 'data', 'LE_Destinations.csv');
  const jsonPath = path.join(process.cwd(), 'data', 'destinations.json');
  
  const destinations = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        destinations.push({
          country_code: row.country_code,
          country_name: row.country_name,
          geo_type: row.geo_type,
          destination: row.destination,
          link: row.link,
          // Add affiliate tracking parameters
          affiliate_link: `${row.link}&utm_source=mondoexplora&utm_medium=affiliate&utm_campaign=route&affiliate_id=mondoexplora_001`
        });
      })
      .on('end', async () => {
        try {
          // Create a lookup object for easy access
          const destinationsLookup = {};
          destinations.forEach(dest => {
            const key = dest.destination.toLowerCase().replace(/\s+/g, '-');
            destinationsLookup[key] = dest;
          });
          
          const jsonData = {
            destinations: destinations,
            lookup: destinationsLookup,
            meta: {
              total_destinations: destinations.length,
              last_updated: new Date().toISOString(),
              source: 'LE_Destinations.csv'
            }
          };
          
          await fsPromises.writeFile(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
          console.log(`✅ Converted ${destinations.length} destinations to JSON`);
          console.log(`📁 Saved to: ${jsonPath}`);
          
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

module.exports = { convertDestinationsCSV }; 