import { BadgeTier } from '@ajgifford/keepwatching-types';

export interface TierStyle {
  label: string;
  color: string;
}

export const TIER_STYLES: Record<BadgeTier, TierStyle> = {
  bronze: { label: 'Bronze', color: '#CD7F32' },
  silver: { label: 'Silver', color: '#9E9E9E' },
  gold: { label: 'Gold', color: '#D4AF37' },
  platinum: { label: 'Platinum', color: '#6FD3E8' },
};

/** Ordinal rank for comparing tiers, e.g. picking the highest tier among several newly-unlocked badges. */
export const TIER_RANK: Record<BadgeTier, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
};
