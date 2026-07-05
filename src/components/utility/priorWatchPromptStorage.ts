type KeyPart = number | string | undefined;

const buildKey = (showId: KeyPart, profileId: KeyPart) => `shown-prior-prompt-${showId}-${profileId}`;

/**
 * Key used to remember (per browser, per show+profile) that the "have you watched this
 * show before?" prompt has already been shown, so it only interrupts the user once.
 */
export const getPriorWatchPromptKey = (showId: KeyPart, profileId: KeyPart): string => buildKey(showId, profileId);

/**
 * Clears the "already shown" flag so the prompt can re-trigger. Used when a show's watch
 * history is wiped (un-favorite with "Remove entirely") — the show is genuinely back to a
 * never-watched state, so the one-time prompt should be eligible to show again next time
 * it's favorited, instead of staying silently suppressed from a prior showing.
 */
export const clearPriorWatchPromptFlag = (showId: KeyPart, profileId: KeyPart): void => {
  localStorage.removeItem(buildKey(showId, profileId));
};
