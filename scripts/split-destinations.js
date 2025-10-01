const fs = require('fs');
const path = require('path');

// Read the destinations.json file
const destinationsPath = path.join(process.cwd(), 'data', 'destinations.json');
const outputDir = path.join(process.cwd(), 'data', 'le_destination_urls');

try {
  const destinationsData = JSON.parse(fs.readFileSync(destinationsPath, 'utf8'));
  
  console.log(`Found ${destinationsData.destinations.length} destinations`);
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Process each destination
  destinationsData.destinations.forEach((destination, index) => {
    const destinationName = destination.destination.toLowerCase().replace(/\s+/g, '-');
    const fileName = `${destinationName}.json`;
    const filePath = path.join(outputDir, fileName);
    
    // Write individual destination file
    fs.writeFileSync(filePath, JSON.stringify(destination, null, 2));
    
    console.log(`Created: ${fileName}`);
  });
  
  console.log(`\n✅ Successfully split ${destinationsData.destinations.length} destinations into individual files in ${outputDir}`);
  
} catch (error) {
  console.error('Error processing destinations:', error);
} 