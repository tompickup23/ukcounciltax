import { councilPages, type CouncilPage } from './paths';
import type { Council } from './registry';

const TYPE_PLURAL: Record<string, string> = {
  "Unitary authority": "unitary authorities",
  "Non-metropolitan district": "non-metropolitan districts",
  "Metropolitan district": "metropolitan districts",
  "London borough": "London boroughs",
};

export interface SimilarCouncils {
  /** "Other metropolitan districts in North West". */
  heading: string;
  pages: CouncilPage[];
}

/**
 * Councils of the same registry type that have a page. A district is listed
 * with the other districts of its county (the registry's parentGss); every
 * other type with the others of its region. Sorted by name, the council itself
 * left out. Null when there is no such council.
 */
export function similarCouncils(council: Council): SimilarCouncils | null {
  const byCounty = council.type === "Non-metropolitan district" && council.parentGss !== null && council.county !== null;
  const pages = councilPages().filter(({ council: other }) =>
    other.gss !== council.gss
    && other.type === council.type
    && (byCounty ? other.parentGss === council.parentGss : other.region === council.region));
  if (pages.length === 0) return null;
  const place = byCounty ? council.county : council.region;
  const plural = TYPE_PLURAL[council.type] ?? `councils of type ${council.type.toLowerCase()}`;
  return { heading: `Other ${plural} in ${place}`, pages };
}
