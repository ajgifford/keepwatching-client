import { useMemo, useState } from 'react';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useDateFormatters } from '../../../app/hooks/useDateFormatters';
import { markSeasonIdsAsPriorWatched, selectShow } from '../../../app/slices/activeShowSlice';
import { calculateCatchUpStats } from '../../utility/catchUpUtility';
import { calculateRuntimeDisplay } from '../../utility/contentUtility';

interface CatchUpModeCardProps {
  profileId: number;
}

export const CatchUpModeCard = ({ profileId }: CatchUpModeCardProps) => {
  const dispatch = useAppDispatch();
  const show = useAppSelector(selectShow);
  const formatters = useDateFormatters();
  const theme = useTheme();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [marking, setMarking] = useState(false);

  const stats = useMemo(() => calculateCatchUpStats(show), [show]);

  if (!stats) {
    return null;
  }

  const episodeLabel = stats.totalEpisodesRemaining === 1 ? 'episode' : 'episodes';
  const seasonLabel = stats.seasons.length === 1 ? 'season' : 'seasons';
  const runtimeDisplay = calculateRuntimeDisplay(stats.totalRuntimeRemaining);
  const pace = stats.pace && stats.pace.estimatedCompletionDate ? stats.pace : null;

  const handleConfirmMarkCaughtUp = async () => {
    if (!show) return;
    setConfirmOpen(false);
    setMarking(true);
    try {
      await dispatch(
        markSeasonIdsAsPriorWatched({
          profileId,
          showId: show.id,
          seasonIds: stats.seasons.map((season) => season.seasonId),
        })
      );
    } finally {
      setMarking(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 1,
        borderLeft: 4,
        borderLeftColor: 'primary.main',
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <PlayCircleOutlineIcon color="primary" fontSize="small" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Catch-Up Mode
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {stats.totalEpisodesRemaining} {episodeLabel} left
        <Typography component="span" variant="body1" sx={{ fontWeight: 400, color: 'text.secondary', ml: 1 }}>
          • ~{runtimeDisplay}
          {stats.hasMissingRuntime ? ' (estimate incomplete)' : ''}
        </Typography>
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
        {pace && <TrendingUpIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {pace
            ? `At your recent pace (${pace.episodesPerWeek.toFixed(1)} eps/week), caught up by ${formatters.contentDate(
                pace.estimatedCompletionDate
              )}`
            : 'Not enough recent activity to estimate your pace.'}
        </Typography>
      </Box>

      <Button
        variant="outlined"
        size="small"
        startIcon={<CheckCircleIcon />}
        onClick={() => setConfirmOpen(true)}
        disabled={marking}
        sx={{ mt: 1.5 }}
      >
        Mark Caught Up
      </Button>

      <Accordion
        sx={{ mt: 1.5, boxShadow: 'none', backgroundColor: 'transparent', '&:before': { display: 'none' } }}
        disableGutters
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Season breakdown
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
          <Box>
            {stats.seasons.map((season, index) => (
              <Box key={season.seasonId}>
                {index > 0 && <Divider sx={{ my: 1, opacity: 0.6 }} />}
                <Grid container>
                  <Grid size={6}>
                    <Typography variant="body2">Season {season.seasonNumber}</Typography>
                  </Grid>
                  <Grid size={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {season.episodesRemaining} {season.episodesRemaining === 1 ? 'episode' : 'episodes'} • ~
                      {calculateRuntimeDisplay(season.runtimeRemaining)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Mark Caught Up?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Mark {stats.totalEpisodesRemaining} remaining {episodeLabel} across {stats.seasons.length} {seasonLabel} as
            previously watched? This uses each episode's air date, so it won't skew your stats.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmMarkCaughtUp} variant="contained" startIcon={<CheckCircleIcon />}>
            Mark Caught Up
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
