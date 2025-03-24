import { Box, Divider, LinearProgress, Typography } from '@mui/material';
import { ShowProgress } from '../../../app/model/statistics';

interface ShowProgressListProps {
  shows: ShowProgress[];
  maxHeight?: number | string;
  filter?: 'WATCHED' | 'WATCHING' | 'NOT_WATCHED' | null;
}

const ShowProgressList = ({ shows, maxHeight = 300, filter = 'WATCHING' }: ShowProgressListProps) => {
  const filteredShows = filter ? shows.filter((show) => show.status === filter) : shows;
  
  // Sort by completion percentage (descending)
  const sortedShows = [...filteredShows].sort((a, b) => b.percentComplete - a.percentComplete);

  if (sortedShows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        {filter === 'WATCHING' 
          ? "No shows currently being watched" 
          : filter === 'WATCHED'
          ? "No shows completed yet"
          : filter === 'NOT_WATCHED'
          ? "No unwatched shows"
          : "No shows available"}
      </Typography>
    );
  }

  return (
    <Box sx={{ maxHeight, overflow: 'auto' }}>
      {sortedShows.map((show, index) => (
        <Box key={show.showId} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">{show.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {show.watchedEpisodes}/{show.totalEpisodes}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={show.percentComplete}
            color={show.percentComplete > 75 ? 'success' : show.percentComplete > 25 ? 'warning' : 'error'}
            sx={{ height: 8, borderRadius: 4 }}
          />
          {index < sortedShows.length - 1 && <Divider sx={{ mt: 1 }} />}
        </Box>
      ))}
    </Box>
  );
};

export default ShowProgressList;
