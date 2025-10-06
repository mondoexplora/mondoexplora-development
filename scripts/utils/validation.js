/**
 * Validates hotel data to ensure all required fields are present and valid
 */
function validateHotelData(row, requiredFields) {
  // Check if all required fields are present and not empty
  for (const field of requiredFields) {
    if (!row[field] || row[field].toString().trim() === '') {
      return false;
    }
  }
  
  // Validate price is a positive number
  const price = parseFloat(row.price);
  if (isNaN(price) || price <= 0) {
    return false;
  }
  
  // Validate discount percentage
  const discount = parseInt(row.percentage_discount);
  if (isNaN(discount) || discount < 0 || discount > 100) {
    return false;
  }
  
  // Validate date format
  if (!isValidDate(row.end_date_utc)) {
    return false;
  }
  
  return true;
}

/**
 * Checks if an offer has expired
 */
function isOfferExpired(endDateUtc) {
  const endDate = new Date(endDateUtc);
  const now = new Date();
  return endDate < now;
}

/**
 * Validates if a string is a valid date
 */
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Sanitizes text for safe JSON output
 */
function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates image URL
 */
function isValidImageUrl(url) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = {
  validateHotelData,
  isOfferExpired,
  isValidDate,
  sanitizeText,
  isValidImageUrl
}; 