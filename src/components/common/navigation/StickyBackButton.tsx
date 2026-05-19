import React from 'react';
import { useNavigate } from 'react-router-dom';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Box, IconButton, Tooltip } from '@mui/material';

interface StickyBackButtonProps {
  returnPath: string;
  genreFilter?: string;
  streamingServiceFilter?: string;
  watchStatusFilter?: string;
  pathLabelMap?: Record<string, string>;
}

export function StickyBackButton({
  returnPath,
  genreFilter,
  streamingServiceFilter,
  watchStatusFilter,
  pathLabelMap = {},
}: StickyBackButtonProps) {
  const navigate = useNavigate();

  const buildBackButtonPath = () => {
    let path = returnPath;
    if (genreFilter) {
      path += path.includes('?') ? '&' : '?';
      path += `genre=${encodeURIComponent(genreFilter)}`;
    }
    if (streamingServiceFilter) {
      path += path.includes('?') ? '&' : '?';
      path += `streamingService=${encodeURIComponent(streamingServiceFilter)}`;
    }
    if (watchStatusFilter) {
      path += path.includes('?') ? '&' : '?';
      path += `watchStatus=${encodeURIComponent(watchStatusFilter)}`;
    }
    return path;
  };

  const getTooltip = () => {
    const basePath = returnPath.split('?')[0];
    return pathLabelMap[basePath] || 'Back';
  };

  return (
    <Box sx={{ px: 2, position: 'sticky', top: 0, zIndex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1, position: 'relative', zIndex: 1 }}>
        <Tooltip title={getTooltip()}>
          <IconButton aria-label="back" onClick={() => navigate(buildBackButtonPath())} sx={{ color: 'text.primary' }}>
            <ArrowBackIosIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
