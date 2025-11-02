import React from 'react';

import {
  LocalMovies as MovieIcon,
  AccessTime as TimeIcon,
  EmojiEvents as TrophyIcon,
  Tv as TvIcon,
} from '@mui/icons-material';
import { Chip, Tooltip, alpha, useTheme } from '@mui/material';

interface MilestoneBadgeProps {
  type: 'episodes' | 'movies' | 'hours';
  threshold: number;
  achieved: boolean;
  onClick?: () => void;
  currentProgress?: number;
}

function getMilestoneIcon(type: 'episodes' | 'movies' | 'hours') {
  switch (type) {
    case 'episodes':
      return <TvIcon sx={{ fontSize: '1rem' }} />;
    case 'movies':
      return <MovieIcon sx={{ fontSize: '1rem' }} />;
    case 'hours':
      return <TimeIcon sx={{ fontSize: '1rem' }} />;
  }
}

function getMilestoneLabel(type: 'episodes' | 'movies' | 'hours', threshold: number): string {
  const formattedNumber = threshold.toLocaleString();
  switch (type) {
    case 'episodes':
      return `${formattedNumber} Episodes`;
    case 'movies':
      return `${formattedNumber} Movies`;
    case 'hours':
      return `${formattedNumber} Hours`;
  }
}

function getTooltipContent(
  type: 'episodes' | 'movies' | 'hours',
  threshold: number,
  achieved: boolean,
  currentProgress?: number
): React.ReactNode {
  const formattedThreshold = threshold.toLocaleString();
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

  if (achieved) {
    return `🏆 Milestone Unlocked: ${formattedThreshold} ${typeLabel}!`;
  }

  if (currentProgress !== undefined) {
    const remaining = threshold - currentProgress;
    const formattedRemaining = remaining.toLocaleString();
    const formattedCurrent = currentProgress.toLocaleString();
    return (
      <>
        Next Goal: {formattedThreshold} {typeLabel}
        <br />
        Progress: {formattedCurrent}/{formattedThreshold}
        <br />
        {formattedRemaining} to go!
      </>
    );
  }

  return `Next Goal: ${formattedThreshold} ${typeLabel}`;
}

export const MilestoneBadge: React.FC<MilestoneBadgeProps> = ({
  type,
  threshold,
  achieved,
  onClick,
  currentProgress,
}) => {
  const theme = useTheme();

  const backgroundColor = achieved ? alpha(theme.palette.warning.main, 0.2) : alpha(theme.palette.grey[500], 0.15);

  const textColor = achieved ? theme.palette.warning.light : alpha('#ffffff', 0.6);

  const borderColor = achieved ? alpha(theme.palette.warning.main, 0.5) : alpha('#ffffff', 0.2);

  const tooltipContent = getTooltipContent(type, threshold, achieved, currentProgress);

  return (
    <Tooltip
      title={tooltipContent}
      arrow
      placement="bottom"
      slotProps={{
        tooltip: {
          sx: {
            textAlign: 'center',
          },
        },
      }}
    >
      <Chip
        icon={getMilestoneIcon(type)}
        label={getMilestoneLabel(type, threshold)}
        size="small"
        onClick={onClick}
        deleteIcon={achieved ? <TrophyIcon sx={{ fontSize: '1rem' }} /> : undefined}
        onDelete={achieved ? () => {} : undefined}
        sx={{
          backgroundColor,
          color: textColor,
          border: `1px solid ${borderColor}`,
          backdropFilter: 'blur(10px)',
          fontWeight: achieved ? 600 : 400,
          fontSize: '0.75rem',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          boxShadow: achieved ? `0 0 10px ${alpha(theme.palette.warning.main, 0.3)}` : 'none',
          '&:hover': onClick
            ? {
                backgroundColor: achieved
                  ? alpha(theme.palette.warning.main, 0.3)
                  : alpha(theme.palette.grey[500], 0.25),
                transform: 'translateY(-1px)',
                boxShadow: achieved ? `0 0 15px ${alpha(theme.palette.warning.main, 0.4)}` : 'none',
              }
            : {},
          '& .MuiChip-icon': {
            color: textColor,
          },
          '& .MuiChip-deleteIcon': {
            color: theme.palette.warning.main,
            '&:hover': {
              color: theme.palette.warning.light,
            },
          },
        }}
      />
    </Tooltip>
  );
};

export default MilestoneBadge;
