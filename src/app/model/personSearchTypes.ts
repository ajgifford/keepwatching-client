import { SearchPersonCredit } from '@ajgifford/keepwatching-types';

export interface PersonSearchDetails {
  id: number;
  name: string;
  profileImage: string;
  knownFor: string[] | null;
  department: string;
  popularity: number | null;
  biography: string | null;
  birthday: string | null;
  birthplace: string | null;
  deathday: string | null;
  movieCredits: SearchPersonCredit[];
  tvCredits: SearchPersonCredit[];
  totalCredits: number;
}

// Auto-selection thresholds
export const PERSON_SEARCH_CONFIG = {
  HIGH_CONFIDENCE_POPULARITY: 15.0,
  MEDIUM_CONFIDENCE_POPULARITY: 5.0,
  EXACT_MATCH_BOOST: 2.0,
  ACTOR_DEPARTMENT_BOOST: 1.5,
} as const;
