'use client';

import Link from 'next/link';
import { useState } from 'react';

/** Mirrors lib/regional-data. Declared here so the client bundle never pulls in
 *  a module that imports fs. */
interface CountryEntry {
  hotelCount: number;
  destinations: { [destination: string]: { hotelCount: number; minPrice?: number } };
}

export interface RegionalData {
  [region: string]: {
    totalHotels: number;
    countries: { [country: string]: CountryEntry };
  };
}

interface HomeRegionsProps {
  regionalData: RegionalData;
  lang: string;
  totalHotels: number;
  /** Countries per region, and destinations per country card. */
  countriesShown?: number;
  destinationsShown?: number;
}

function destinationSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function countrySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function displayName(name: string): string {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Browse by region.
 *
 * Demoted below the deals and the experiences, but kept whole: these tabs are the
 * only internal links to ~1,100 destination pages and ~65 country pages, so
 * deleting them would strand the pages the deals themselves link into.
 */
export default function HomeRegions({
  regionalData,
  lang,
  totalHotels,
  countriesShown = 6,
  destinationsShown = 5,
}: HomeRegionsProps) {
  const regions = Object.entries(regionalData).sort(
    (a, b) => b[1].totalHotels - a[1].totalHotels
  );

  // Open on the deepest region rather than a hardcoded name, so a data refresh
  // that reshuffles the catalogue cannot land the page on a near-empty tab.
  const [active, setActive] = useState(regions[0]?.[0] ?? '');

  const countries = Object.entries(regionalData[active]?.countries ?? {})
    .sort((a, b) => b[1].hotelCount - a[1].hotelCount)
    .slice(0, countriesShown);

  return (
    <section className="mx-sec" id="regions" aria-labelledby="mx-regions">
      <div className="mx-wrap">
        <div className="mx-sec-head">
          <h2 id="mx-regions">
            Browse {totalHotels.toLocaleString('en-GB')} hotels by region
          </h2>
        </div>
        <p className="mx-sec-sub">
          Every destination page lists its own deals, hotel count and starting
          price.
        </p>

        <div className="mx-tabs" role="tablist" aria-label="Regions">
          {regions.map(([region, data]) => (
            <button
              key={region}
              type="button"
              role="tab"
              aria-selected={region === active}
              className={region === active ? 'on' : undefined}
              onClick={() => setActive(region)}
            >
              {region}
              <span className="n">{data.totalHotels.toLocaleString('en-GB')}</span>
            </button>
          ))}
        </div>

        <div className="mx-cgrid">
          {countries.map(([country, data]) => {
            const destinations = Object.entries(data.destinations)
              .sort((a, b) => b[1].hotelCount - a[1].hotelCount)
              .slice(0, destinationsShown);

            return (
              <div className="mx-ccard" key={country}>
                <h3>{country}</h3>
                <div className="count">
                  {data.hotelCount.toLocaleString('en-GB')} hotels ·{' '}
                  {Object.keys(data.destinations).length} destinations
                </div>

                {destinations.map(([destination, info]) => (
                  <Link
                    key={destination}
                    href={`/${lang}/destination/${destinationSlug(destination)}/`}
                    className="row"
                  >
                    <span className="city">{displayName(destination)}</span>
                    {info.minPrice ? (
                      <span className="from">from ${Math.round(info.minPrice)}</span>
                    ) : (
                      <span className="from">{info.hotelCount} hotels</span>
                    )}
                  </Link>
                ))}

                <Link
                  href={`/${lang}/country/${countrySlug(country)}/`}
                  className="all"
                >
                  All destinations in {country} →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
