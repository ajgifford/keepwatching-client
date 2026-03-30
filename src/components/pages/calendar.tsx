import React from 'react';
import { useNavigate } from 'react-router-dom';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Box, Container, IconButton, Tooltip } from '@mui/material';

import { ContentCalendar } from '../common/calendar/contentCalendar';

const Calendar: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Back button */}
      <Box
        sx={{
          px: 2,
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          mb={2}
          mt={1}
          sx={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Tooltip title="Back">
            <IconButton aria-label="back" onClick={handleBack} sx={{ color: 'text.primary' }}>
              <ArrowBackIosIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <ContentCalendar compact={false} />
    </Container>
  );
};

export default Calendar;
