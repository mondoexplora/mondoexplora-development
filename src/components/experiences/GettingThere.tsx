import { GatewayCity } from '@/lib/experiences';
import GatewayLink from './GatewayLink';

interface GettingThereProps {
  cities: GatewayCity[];
  locationName: string;
}

/**
 * "How to get there" — one of the section's two monetised surfaces, so it is
 * built as a prominent module with a real button per city rather than a table of
 * text links. Every row is a tracked outbound click.
 */
export default function GettingThere({ cities, locationName }: GettingThereProps) {
  if (cities.length === 0) return null;

  return (
    <div>
      <div className="exp-getting">
        <div className="exp-getting-head">
          <span className="exp-getting-icon" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 17h2l2-9h8l2 9h2" />
              <circle cx="7.5" cy="18.5" r="1.8" />
              <circle cx="16.5" cy="18.5" r="1.8" />
              <path d="M12 3v5" />
              <path d="m9.5 5.5 2.5-2.5 2.5 2.5" />
            </svg>
          </span>
          <div>
            <h2>How to get there</h2>
            <p>
              Compare flights, trains, buses and driving to {locationName} from the{' '}
              {cities.length} nearest cities.
            </p>
          </div>
        </div>

        {cities.map((city, i) => (
          <GatewayLink
            key={`${city.name}-${city.country}`}
            rome2rioUrl={city.rome2rio_url}
            className={i === 0 ? 'exp-gateway closest' : 'exp-gateway'}
          >
            <span>
              <span className="exp-gateway-city">
                {city.name}
                {i === 0 && <span className="exp-gateway-tag">CLOSEST</span>}
              </span>
              <span className="exp-gateway-country">{city.country}</span>
            </span>
            <span className="exp-gateway-figures">
              <span className="exp-gateway-figure">
                <strong className="drive">{city.drive_time_estimate}</strong>
                <span>by car</span>
              </span>
              <span className="exp-gateway-figure">
                <strong className="dist">{Math.round(city.distance_km)} km</strong>
                <span>distance</span>
              </span>
            </span>
            <span className={i === 0 ? 'exp-btn-primary' : 'exp-btn-outline'}>
              Plan this journey
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h13" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </GatewayLink>
        ))}

        <div className="exp-getting-foot">
          <p>
            Routes open on Rome2Rio, which compares flights, trains, buses and
            driving. MondoExplora does not sell transport.
          </p>
        </div>
      </div>
    </div>
  );
}
