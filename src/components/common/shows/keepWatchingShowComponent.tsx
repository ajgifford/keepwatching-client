import { useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectShow, selectWatchedEpisodes, updateEpisodeWatchStatus } from '../../../app/slices/activeShowSlice';
import SkippedEpisodesDialog from './SkippedEpisodesDialog';
import { EpisodeCard } from './episodeCard';
import { NextEpisode, ProfileEpisode, ProfileSeason, UserWatchStatus, WatchStatus } from '@ajgifford/keepwatching-types';
import { parseLocalDate } from '@ajgifford/keepwatching-ui';

export const KeepWatchingShowComponent = ({ profileId }: { profileId: number }) => {
  const dispatch = useAppDispatch();
  const show = useAppSelector(selectShow);
  const watchedEpisodes = useAppSelector(selectWatchedEpisodes);

  const [skippedEpisodesDialogOpen, setSkippedEpisodesDialogOpen] = useState(false);
  const [pendingEpisode, setPendingEpisode] = useState<ProfileEpisode | null>(null);
  const [skippedEpisodes, setSkippedEpisodes] = useState<ProfileEpisode[]>([]);

  const dispatchEpisodeWatchUpdate = async (episodeId: number, newStatus: UserWatchStatus) => {
    await dispatch(updateEpisodeWatchStatus({ profileId, episodeId, episodeStatus: newStatus }));
  };

  const handleEpisodeWatchStatusChange = async (episode: NextEpisode, newStatus: UserWatchStatus) => {
    if (!show) return;

    if (newStatus === WatchStatus.WATCHED && show.seasons) {
      const today = new Date();
      const currentSeason = show.seasons.find((s: ProfileSeason) => s.id === episode.seasonId);
      if (currentSeason) {
        const unwatchedPrior = currentSeason.episodes.filter(
          (e: ProfileEpisode) =>
            e.episodeNumber < episode.episodeNumber &&
            !watchedEpisodes[e.id] &&
            e.airDate &&
            new Date(e.airDate) <= today
        );
        if (unwatchedPrior.length > 0) {
          const profileEpisode = currentSeason.episodes.find((e: ProfileEpisode) => e.id === episode.episodeId);
          if (profileEpisode) {
            setPendingEpisode(profileEpisode);
            setSkippedEpisodes(unwatchedPrior);
            setSkippedEpisodesDialogOpen(true);
            return;
          }
        }
      }
    }

    await dispatchEpisodeWatchUpdate(episode.episodeId, newStatus);
  };

  const handleMarkAllSkippedAndTarget = async () => {
    setSkippedEpisodesDialogOpen(false);
    for (const ep of skippedEpisodes) {
      await dispatchEpisodeWatchUpdate(ep.id, WatchStatus.WATCHED);
    }
    if (pendingEpisode) {
      await dispatchEpisodeWatchUpdate(pendingEpisode.id, WatchStatus.WATCHED);
    }
    setPendingEpisode(null);
    setSkippedEpisodes([]);
  };

  const handleMarkJustTarget = async () => {
    setSkippedEpisodesDialogOpen(false);
    if (pendingEpisode) {
      await dispatchEpisodeWatchUpdate(pendingEpisode.id, WatchStatus.WATCHED);
    }
    setPendingEpisode(null);
    setSkippedEpisodes([]);
  };

  if (!show || !show.seasons) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No episodes available to watch
        </Typography>
      </Box>
    );
  }

  // Step 1: Find active seasons (have watched episodes AND have remaining unwatched episodes)
  const activeSeasons = show.seasons.filter((season: ProfileSeason) => {
    const hasWatchedEpisodes = season.episodes.some((ep) => watchedEpisodes[ep.id]);
    const hasUnwatchedAiredEpisodes = season.episodes.some(
      (ep) => !watchedEpisodes[ep.id] && ep.airDate && parseLocalDate(ep.airDate) <= new Date()
    );
    return hasWatchedEpisodes && hasUnwatchedAiredEpisodes;
  });

  // Step 2: Determine which seasons to use (active seasons, or fall back to all seasons with unwatched episodes)
  const seasonsToProcess =
    activeSeasons.length > 0
      ? activeSeasons
      : show.seasons.filter((s) =>
          s.episodes.some((ep) => !watchedEpisodes[ep.id] && ep.airDate && parseLocalDate(ep.airDate) <= new Date())
        );

  // Step 3: Get unwatched episodes per season
  const episodesBySeason: Map<number, NextEpisode[]> = new Map();
  seasonsToProcess.forEach((season: ProfileSeason) => {
    const unwatchedEpisodes = season.episodes
      .filter((ep) => !watchedEpisodes[ep.id] && ep.airDate && parseLocalDate(ep.airDate) <= new Date())
      .sort((a, b) => a.episodeNumber - b.episodeNumber)
      .map((episode) => ({
        profileId,
        showId: show.id,
        showName: show.title,
        seasonId: season.id,
        episodeId: episode.id,
        network: show.network || '',
        streamingServices: show.streamingServices || '',
        episodeTitle: episode.title,
        airDate: episode.airDate,
        runtime: episode.runtime,
        episodeNumber: episode.episodeNumber,
        seasonNumber: season.seasonNumber,
        overview: episode.overview,
        posterImage: show.posterImage,
        episodeStillImage: episode.stillImage,
      }));

    if (unwatchedEpisodes.length > 0) {
      episodesBySeason.set(season.seasonNumber, unwatchedEpisodes);
    }
  });

  // Step 4: Round-robin to collect up to 6 episodes from active seasons
  const nextEpisodes: NextEpisode[] = [];
  const seasonNumbers = Array.from(episodesBySeason.keys()).sort((a, b) => a - b);
  const indices: Map<number, number> = new Map(seasonNumbers.map((sn) => [sn, 0]));

  while (nextEpisodes.length < 6 && seasonNumbers.length > 0) {
    for (const seasonNum of [...seasonNumbers]) {
      if (nextEpisodes.length >= 6) break;

      const episodes = episodesBySeason.get(seasonNum);
      const idx = indices.get(seasonNum);

      if (episodes && idx !== undefined && idx < episodes.length) {
        nextEpisodes.push(episodes[idx]);
        indices.set(seasonNum, idx + 1);
      } else {
        // This season is exhausted, remove it
        seasonNumbers.splice(seasonNumbers.indexOf(seasonNum), 1);
      }
    }
  }

  if (nextEpisodes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {`You've watched all available episodes!`}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Check back later for new episodes
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {nextEpisodes.map((episode) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`next-episode-${episode.episodeId}`}>
            <EpisodeCard
              key={`episode-${show.id}-${episode.seasonNumber}-${episode.episodeNumber}`}
              episode={episode}
              onWatchStatusChange={handleEpisodeWatchStatusChange}
            />
          </Grid>
        ))}
      </Grid>

      <SkippedEpisodesDialog
        open={skippedEpisodesDialogOpen}
        skippedEpisodes={skippedEpisodes}
        targetEpisode={pendingEpisode}
        onMarkAll={handleMarkAllSkippedAndTarget}
        onMarkJustThis={handleMarkJustTarget}
        onClose={() => {
          setSkippedEpisodesDialogOpen(false);
          setPendingEpisode(null);
          setSkippedEpisodes([]);
        }}
      />
    </Box>
  );
};
