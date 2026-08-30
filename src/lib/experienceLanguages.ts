/**
 * Languages the /experiences section is built for.
 *
 * The rest of the site declares six languages in SUPPORTED_LANGUAGES, but the
 * experience feed is English-only today — data/experiences/explore-share.csv has
 * one set of English titles and descriptions. Building the other five would ship
 * ~21,000 duplicate-content pages, so the section is gated here until the feed is
 * translated. Add a language to this list once its copy exists.
 */
export const EXPERIENCE_LANGUAGES: string[] = ['en'];
