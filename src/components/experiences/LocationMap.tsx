import { Experience } from '@/lib/experiences';

/**
 * Relative-position map of the experience and its gateway cities.
 *
 * Static export rules out a tile layer (no runtime key, no network at build), so
 * rather than a fake map this plots the real coordinates on an equirectangular
 * projection fitted to their bounding box: the pin and the city dots sit in
 * genuinely correct positions relative to one another. Labelled as such, because
 * it is not a street map and should not be read as one.
 */

interface LocationMapProps {
  experience: Experience;
  height?: number;
}

const W = 860;
const H = 340;
const PAD = 56;

export default function LocationMap({ experience, height = H }: LocationMapProps) {
  const cities = experience.gatewayCities.slice(0, 4);
  const points = [
    { lat: experience.lat, lng: experience.lng },
    ...cities.map((c) => ({ lat: c.latitude, lng: c.longitude })),
  ];

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const latMin = Math.min(...lats);
  const latMax = Math.max(...lats);
  const lngMin = Math.min(...lngs);
  const lngMax = Math.max(...lngs);

  // Guard against a degenerate box when every point coincides.
  const latSpan = Math.max(latMax - latMin, 0.05);
  const lngSpan = Math.max(lngMax - lngMin, 0.05);

  const project = (lat: number, lng: number) => ({
    x: PAD + ((lng - lngMin) / lngSpan) * (W - PAD * 2),
    // Latitude increases northward, y increases downward.
    y: PAD + ((latMax - lat) / latSpan) * (H - PAD * 2),
  });

  const pin = project(experience.lat, experience.lng);

  return (
    <div className="exp-map" style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`Relative position of ${experience.locationName} and its nearest cities`}
      >
        <rect width={W} height={H} fill="#e9eef2" />

        <g stroke="#dfe6ec" strokeWidth="1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <path key={`v${i}`} d={`M${(W / 8) * i} 0V${H}`} />
          ))}
          {[1, 2, 3, 4].map((i) => (
            <path key={`h${i}`} d={`M0 ${(H / 5) * i}H${W}`} />
          ))}
        </g>

        {/* Connectors from each city to the experience, so distance reads visually. */}
        {cities.map((c) => {
          const p = project(c.latitude, c.longitude);
          return (
            <path
              key={`line-${c.name}`}
              d={`M${p.x} ${p.y} L${pin.x} ${pin.y}`}
              stroke="#b9c6d3"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              fill="none"
            />
          );
        })}

        {cities.map((c) => {
          const p = project(c.latitude, c.longitude);
          const flip = p.x > W - 160;
          return (
            <g key={c.name} fontFamily="Inter, Arial, sans-serif" fontSize="12" fill="#6c757d">
              <circle cx={p.x} cy={p.y} r="4.5" fill="#8a99a8" />
              <text x={flip ? p.x - 12 : p.x + 12} y={p.y + 4} textAnchor={flip ? 'end' : 'start'}>
                {c.name} · {Math.round(c.distance_km)} km
              </text>
            </g>
          );
        })}

        <g transform={`translate(${pin.x},${pin.y - 16})`}>
          <circle cx="0" cy="18" r="26" fill="#28a745" opacity="0.16" />
          <path
            d="M0 34 C0 34 -14 16 -14 6 A14 14 0 1 1 14 6 C14 16 0 34 0 34 Z"
            fill="#28a745"
            stroke="#fff"
            strokeWidth="2.5"
          />
          <circle cx="0" cy="6" r="5" fill="#fff" />
          <text
            x={pin.x > W - 220 ? -22 : 22}
            y="10"
            textAnchor={pin.x > W - 220 ? 'end' : 'start'}
            fontFamily="Inter, Arial, sans-serif"
            fontSize="13"
            fontWeight="700"
            fill="#2a3f59"
          >
            {experience.locationName}
          </text>
        </g>
      </svg>
      <div className="exp-map-note">
        Relative positions, not a street map · {experience.lat.toFixed(4)},{' '}
        {experience.lng.toFixed(4)}
      </div>
    </div>
  );
}
