/**
 * Generous lat/lng bounding boxes per country, used only to reject experiences
 * whose stored coordinate cannot possibly be inside the country the feed claims.
 *
 * Deliberately loose: the goal is catching a geocoder that fell back to the wrong
 * continent, not policing borders. Overseas territories are folded into the parent
 * where the feed treats them as one country (France includes La Reunion and
 * Guadeloupe, the US includes Alaska and Hawaii), because a tight box there would
 * reject valid rows.
 *
 * A country absent from this table is not validated by bounds — see
 * `hasReliableCoordinates()` in experiences.ts for the checks that always run.
 */

export interface CountryBounds {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
}

export const COUNTRY_BOUNDS: Record<string, CountryBounds> = {
  Albania: { latMin: 39.5, latMax: 42.7, lngMin: 19.2, lngMax: 21.1 },
  Andorra: { latMin: 42.4, latMax: 42.7, lngMin: 1.4, lngMax: 1.8 },
  Antarctica: { latMin: -90.0, latMax: -59.0, lngMin: -180.0, lngMax: 180.0 },
  Argentina: { latMin: -55.2, latMax: -21.6, lngMin: -73.7, lngMax: -53.5 },
  Australia: { latMin: -44.0, latMax: -9.9, lngMin: 112.8, lngMax: 154.0 },
  Austria: { latMin: 46.3, latMax: 49.1, lngMin: 9.4, lngMax: 17.2 },
  Azerbaijan: { latMin: 38.3, latMax: 41.9, lngMin: 44.7, lngMax: 50.6 },
  Belgium: { latMin: 49.4, latMax: 51.6, lngMin: 2.5, lngMax: 6.5 },
  Bhutan: { latMin: 26.6, latMax: 28.4, lngMin: 88.7, lngMax: 92.2 },
  Bolivia: { latMin: -23.0, latMax: -9.6, lngMin: -69.7, lngMax: -57.4 },
  'Bosnia and Herzegovina': { latMin: 42.5, latMax: 45.3, lngMin: 15.7, lngMax: 19.7 },
  Brazil: { latMin: -34.0, latMax: 5.3, lngMin: -74.1, lngMax: -34.7 },
  Bulgaria: { latMin: 41.2, latMax: 44.3, lngMin: 22.3, lngMax: 28.7 },
  Canada: { latMin: 41.6, latMax: 83.2, lngMin: -141.1, lngMax: -52.5 },
  Chile: { latMin: -56.0, latMax: -17.4, lngMin: -75.8, lngMax: -66.3 },
  China: { latMin: 17.9, latMax: 53.6, lngMin: 73.4, lngMax: 135.1 },
  Colombia: { latMin: -4.3, latMax: 13.5, lngMin: -79.1, lngMax: -66.8 },
  'Costa Rica': { latMin: 8.0, latMax: 11.3, lngMin: -86.0, lngMax: -82.5 },
  Croatia: { latMin: 42.3, latMax: 46.6, lngMin: 13.4, lngMax: 19.5 },
  Cyprus: { latMin: 34.5, latMax: 35.8, lngMin: 32.2, lngMax: 34.7 },
  'Czech Republic': { latMin: 48.5, latMax: 51.1, lngMin: 12.0, lngMax: 18.9 },
  Denmark: { latMin: 54.5, latMax: 57.8, lngMin: 8.0, lngMax: 15.2 },
  'Dominican Republic': { latMin: 17.5, latMax: 20.0, lngMin: -72.1, lngMax: -68.3 },
  Ecuador: { latMin: -5.1, latMax: 1.5, lngMin: -92.1, lngMax: -75.2 },
  England: { latMin: 49.9, latMax: 55.9, lngMin: -6.5, lngMax: 1.8 },
  Finland: { latMin: 59.7, latMax: 70.1, lngMin: 20.5, lngMax: 31.6 },
  // Includes La Reunion and Guadeloupe, which the feed files under France.
  France: { latMin: -21.5, latMax: 51.2, lngMin: -61.9, lngMax: 55.9 },
  Georgia: { latMin: 41.0, latMax: 43.6, lngMin: 39.9, lngMax: 46.8 },
  Germany: { latMin: 47.2, latMax: 55.1, lngMin: 5.8, lngMax: 15.1 },
  Greece: { latMin: 34.7, latMax: 41.8, lngMin: 19.3, lngMax: 29.7 },
  Greenland: { latMin: 59.7, latMax: 83.7, lngMin: -73.1, lngMax: -11.3 },
  Guadeloupe: { latMin: 15.8, latMax: 16.6, lngMin: -61.9, lngMax: -60.9 },
  Iceland: { latMin: 63.2, latMax: 66.6, lngMin: -24.6, lngMax: -13.4 },
  India: { latMin: 6.7, latMax: 35.6, lngMin: 68.1, lngMax: 97.4 },
  Indonesia: { latMin: -11.1, latMax: 6.1, lngMin: 94.9, lngMax: 141.1 },
  Italy: { latMin: 35.4, latMax: 47.2, lngMin: 6.5, lngMax: 18.6 },
  Japan: { latMin: 24.0, latMax: 45.6, lngMin: 122.8, lngMax: 146.1 },
  Kazakhstan: { latMin: 40.5, latMax: 55.5, lngMin: 46.4, lngMax: 87.4 },
  Kenya: { latMin: -4.8, latMax: 5.1, lngMin: 33.8, lngMax: 41.9 },
  Kosovo: { latMin: 41.8, latMax: 43.3, lngMin: 20.0, lngMax: 21.8 },
  Kyrgyzstan: { latMin: 39.1, latMax: 43.3, lngMin: 69.2, lngMax: 80.3 },
  Luxembourg: { latMin: 49.4, latMax: 50.2, lngMin: 5.7, lngMax: 6.6 },
  Malaysia: { latMin: 0.8, latMax: 7.4, lngMin: 99.6, lngMax: 119.3 },
  Malta: { latMin: 35.8, latMax: 36.1, lngMin: 14.1, lngMax: 14.6 },
  Mexico: { latMin: 14.5, latMax: 32.8, lngMin: -118.5, lngMax: -86.6 },
  Montenegro: { latMin: 41.8, latMax: 43.6, lngMin: 18.4, lngMax: 20.4 },
  Morocco: { latMin: 27.6, latMax: 36.0, lngMin: -13.2, lngMax: -0.9 },
  Nepal: { latMin: 26.3, latMax: 30.5, lngMin: 80.0, lngMax: 88.2 },
  'New Zealand': { latMin: -47.3, latMax: -34.3, lngMin: 166.4, lngMax: 178.6 },
  'North Macedonia': { latMin: 40.8, latMax: 42.4, lngMin: 20.4, lngMax: 23.1 },
  Norway: { latMin: 57.9, latMax: 71.3, lngMin: 4.0, lngMax: 31.2 },
  Pakistan: { latMin: 23.6, latMax: 37.1, lngMin: 60.8, lngMax: 77.9 },
  Peru: { latMin: -18.4, latMax: 0.1, lngMin: -81.4, lngMax: -68.6 },
  Poland: { latMin: 49.0, latMax: 54.9, lngMin: 14.1, lngMax: 24.2 },
  Portugal: { latMin: 32.3, latMax: 42.2, lngMin: -31.3, lngMax: -6.1 },
  Romania: { latMin: 43.6, latMax: 48.3, lngMin: 20.2, lngMax: 29.8 },
  Russia: { latMin: 41.1, latMax: 82.1, lngMin: 19.6, lngMax: 180.0 },
  Scotland: { latMin: 54.6, latMax: 60.9, lngMin: -8.7, lngMax: -0.7 },
  Senegal: { latMin: 12.2, latMax: 16.7, lngMin: -17.6, lngMax: -11.3 },
  Serbia: { latMin: 42.2, latMax: 46.2, lngMin: 18.8, lngMax: 23.1 },
  Slovakia: { latMin: 47.7, latMax: 49.7, lngMin: 16.8, lngMax: 22.6 },
  Slovenia: { latMin: 45.4, latMax: 46.9, lngMin: 13.3, lngMax: 16.7 },
  'South Africa': { latMin: -35.0, latMax: -22.1, lngMin: 16.4, lngMax: 33.0 },
  Spain: { latMin: 27.6, latMax: 43.9, lngMin: -18.2, lngMax: 4.4 },
  Sweden: { latMin: 55.3, latMax: 69.1, lngMin: 10.9, lngMax: 24.2 },
  Switzerland: { latMin: 45.8, latMax: 47.9, lngMin: 5.9, lngMax: 10.6 },
  Tajikistan: { latMin: 36.6, latMax: 41.1, lngMin: 67.3, lngMax: 75.2 },
  Tanzania: { latMin: -11.8, latMax: -0.9, lngMin: 29.3, lngMax: 40.5 },
  Thailand: { latMin: 5.6, latMax: 20.5, lngMin: 97.3, lngMax: 105.7 },
  Turkey: { latMin: 35.8, latMax: 42.2, lngMin: 25.6, lngMax: 44.9 },
  UK: { latMin: 49.8, latMax: 60.9, lngMin: -8.7, lngMax: 1.8 },
  'United Kingdom': { latMin: 49.8, latMax: 60.9, lngMin: -8.7, lngMax: 1.8 },
  // Includes Alaska and Hawaii.
  'United States': { latMin: 18.9, latMax: 71.5, lngMin: -179.2, lngMax: -66.9 },
  Uzbekistan: { latMin: 37.1, latMax: 45.6, lngMin: 55.9, lngMax: 73.2 },
};

export function isInsideCountry(
  country: string,
  lat: number,
  lng: number
): boolean | null {
  const b = COUNTRY_BOUNDS[country];
  if (!b) return null; // unknown country — cannot judge
  return lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax;
}
