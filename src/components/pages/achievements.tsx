import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import DownloadIcon from '@mui/icons-material/Download';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ShareIcon from '@mui/icons-material/Share';
import { Box, Dialog, DialogContent, Grid, IconButton, Tooltip, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchMilestoneStats,
  markAchievementsViewed,
  selectActiveProfile,
  selectMilestoneStats,
} from '../../app/slices/activeProfileSlice';
import { AchievementBadgeCard } from '../common/achievements/achievementBadgeCard';
import {
  BadgeCategory,
  BadgeInstance,
  getBadgeCatalog,
  getRecentlyUnlockedBadges,
} from '../common/achievements/badgeDefinitions';
import { BadgeShareCard } from '../common/achievements/badgeShareCard';
import { LoadingComponent } from '@ajgifford/keepwatching-ui';
import { toPng } from 'html-to-image';

const CATEGORY_SECTION_TITLE: Record<BadgeCategory, string> = {
  episodes: 'Episodes Watched',
  movies: 'Movies Watched',
  hours: 'Hours Watched',
  showsCompleted: 'Shows Completed',
  anniversary: 'Member Anniversary',
  firstWatch: 'Getting Started',
};

const CATEGORY_ORDER: BadgeCategory[] = ['firstWatch', 'episodes', 'movies', 'hours', 'showsCompleted', 'anniversary'];

function groupByCategory(badges: BadgeInstance[]): Record<BadgeCategory, BadgeInstance[]> {
  const grouped = {} as Record<BadgeCategory, BadgeInstance[]>;
  for (const category of CATEGORY_ORDER) {
    grouped[category] = [];
  }
  for (const badge of badges) {
    grouped[badge.category].push(badge);
  }
  return grouped;
}

function Achievements() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectActiveProfile);
  const milestoneStats = useAppSelector(selectMilestoneStats);
  const [selectedBadge, setSelectedBadge] = useState<BadgeInstance | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const badgeIdParam = searchParams.get('badge');

  useEffect(() => {
    if (profile) {
      dispatch(fetchMilestoneStats());
      dispatch(markAchievementsViewed());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    if (!badgeIdParam || !milestoneStats) return;
    const target = getBadgeCatalog(milestoneStats).find((badge) => badge.id === badgeIdParam);
    if (target) {
      setSelectedBadge(target);
      document.getElementById(`badge-card-${badgeIdParam}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [badgeIdParam, milestoneStats]);

  if (!profile) {
    return <LoadingComponent />;
  }

  if (!milestoneStats) {
    return <LoadingComponent />;
  }

  const catalog = getBadgeCatalog(milestoneStats);
  const unlockedCount = catalog.filter((b) => b.achieved).length;
  const recentlyUnlocked = getRecentlyUnlockedBadges(milestoneStats, 5);
  const grouped = groupByCategory(catalog);

  const handleDownload = async () => {
    if (!shareCardRef.current) return;
    const dataUrl = await toPng(shareCardRef.current, { pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `keepwatching-badge-${selectedBadge?.id ?? 'achievement'}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!shareCardRef.current) return;
    const dataUrl = await toPng(shareCardRef.current, { pixelRatio: 2 });
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'keepwatching-badge.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: selectedBadge?.title ?? 'My KeepWatching Achievement' });
    } else {
      await handleDownload();
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <EmojiEventsIcon color="warning" fontSize="large" />
        <Typography variant="h4">Achievements</Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {unlockedCount} of {catalog.length} badges unlocked
      </Typography>

      {recentlyUnlocked.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Recently Unlocked
          </Typography>
          <Grid container spacing={2}>
            {recentlyUnlocked.map((badge) => (
              <Grid key={badge.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                <AchievementBadgeCard badge={badge} onClick={setSelectedBadge} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {CATEGORY_ORDER.map((category) => {
        const badges = grouped[category];
        if (badges.length === 0) return null;
        return (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              {CATEGORY_SECTION_TITLE[category]}
            </Typography>
            <Grid container spacing={2}>
              {badges.map((badge) => (
                <Grid key={badge.id} id={`badge-card-${badge.id}`} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                  <AchievementBadgeCard badge={badge} onClick={setSelectedBadge} />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}

      <Dialog open={selectedBadge !== null} onClose={() => setSelectedBadge(null)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {selectedBadge && profile && (
            <>
              <BadgeShareCard ref={shareCardRef} profileName={profile.name} badge={selectedBadge} />
              {selectedBadge.achieved ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Download as image">
                    <IconButton aria-label="download as image" onClick={handleDownload}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton aria-label="share" onClick={handleShare}>
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Keep watching to unlock this badge — {Math.round(selectedBadge.progress)}% there.
                </Typography>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Achievements;
