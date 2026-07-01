import { useMemo } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Grid,
  Paper,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import { useAppSelector } from '../../../app/hooks';
import { useDateFormatters } from '../../../app/hooks/useDateFormatters';
import { selectShow } from '../../../app/slices/activeShowSlice';
import { calculateCatchUpStats } from '../../utility/catchUpUtility';
import { calculateRuntimeDisplay } from '../../utility/contentUtility';

export const CatchUpModeCard = () => {
  const show = useAppSelector(selectShow);
  const formatters = useDateFormatters();
  const theme = useTheme();

  const stats = useMemo(() => calculateCatchUpStats(show), [show]);

  if (!stats) {
    return null;
  }

  const episodeLabel = stats.totalEpisodesRemaining === 1 ? 'episode' : 'episodes';
  const runtimeDisplay = calculateRuntimeDisplay(stats.totalRuntimeRemaining);
  const pace = stats.pace && stats.pace.estimatedCompletionDate ? stats.pace : null;

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
    </Paper>
  );
};
