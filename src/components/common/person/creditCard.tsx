import React from 'react';

import { Avatar, Card, CardContent, Chip, Rating, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { buildTMDBImagePath } from '../../utility/contentUtility';
import { Credit, ShowCredit } from '@ajgifford/keepwatching-types';

// Type guard to check if the credit is a ShowCredit
const isShowCredit = (credit: Credit | ShowCredit): credit is ShowCredit => {
  return 'episodeCount' in credit;
};

interface CreditCardProps<T extends Credit = Credit> {
  credit: T;
}

export const CreditCard = <T extends Credit = Credit>({ credit }: CreditCardProps<T>) => {
  const showCredit = isShowCredit(credit);

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          <Grid size={{ xs: 4, md: 2 }}>
            <Avatar
              src={buildTMDBImagePath(credit.poster, 'w92')}
              alt={credit.name}
              variant="rounded"
              sx={{
                width: 92,
                height: '100%',
                '& img': {
                  objectFit: 'cover',
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 8, md: 10 }}>
            <Stack spacing={1} sx={{ height: '100%' }}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {credit.name}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                as {credit.character}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  {credit.year}
                </Typography>

                {showCredit && (
                  <Chip
                    label={`${credit.episodeCount} ep${credit.episodeCount !== 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      height: 18,
                      '& .MuiChip-label': {
                        px: 1,
                      },
                    }}
                  />
                )}
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 'auto' }}>
                <Rating
                  value={credit.rating / 2}
                  max={5}
                  precision={0.1}
                  readOnly
                  size="small"
                  sx={{
                    '& .MuiRating-icon': {
                      fontSize: '1rem',
                    },
                  }}
                />
                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                  {credit.rating.toFixed(1)}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
