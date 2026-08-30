import Link from 'next/link';
import { Experience } from '@/lib/experiences';

interface ExperienceCardProps {
  experience: Experience;
  lang: string;
  /** Region is redundant on a region page, where every card shares it. */
  showRegion?: boolean;
}

function durationLabel(days: number): string {
  if (days < 1) return 'Half day';
  if (days === 1) return '1 day';
  return `${days} days`;
}

export default function ExperienceCard({
  experience,
  lang,
  showRegion = true,
}: ExperienceCardProps) {
  const href = `/${lang}/experiences/${experience.countrySlug}/${experience.regionSlug}/${experience.slug}/`;

  return (
    <Link href={href} className="exp-card">
      <div className="exp-card-img">
        {/* Plain img: next/image is unoptimized under output:'export' anyway, and
            the partner CDN is the only source. */}
        <img src={experience.mainPhoto} alt={experience.title} loading="lazy" />
        <span className="exp-activity">{experience.activity}</span>
        <span className="exp-price">
          €{experience.priceEur}
          <small>from</small>
        </span>
      </div>
      <div className="exp-card-body">
        <h3>{experience.title}</h3>
        <div className="exp-card-loc">
          {experience.locationName}
          {showRegion ? ` · ${experience.region}` : ''}
        </div>
        <p>{experience.shortDescription}</p>
        <div className="exp-card-foot">
          <span className="exp-card-meta">
            {durationLabel(experience.durationDays)}
            {experience.gatewayCities.length > 0
              ? ` · ${experience.gatewayCities.length} cities nearby`
              : ''}
          </span>
          <span className="exp-card-cta">View trip →</span>
        </div>
      </div>
    </Link>
  );
}
