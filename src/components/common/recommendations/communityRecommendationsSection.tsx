import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import {
  Badge,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  IconButton,
  Link,
  Rating,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  addMovieFavorite,
  addShowFavorite,
  selectActiveProfile,
  selectMovies,
  selectShows,
} from '../../../app/slices/activeProfileSlice';
import {
  fetchCommunityRecommendations,
  selectCommunityLoading,
  selectCommunityRecommendations,
  selectContentTypeFilter,
  setContentTypeFilter,
} from '../../../app/slices/communityRecommendationsSlice';
import { CommunityRecommendation, RatingContentType } from '@ajgifford/keepwatching-types';
import { buildTMDBImagePath } from '@ajgifford/keepwatching-ui';
import RecommendationDetailsDialog from './recommendationDetailsDialog';

interface CommunityRecommendationsSectionProps {
  returnPath?: string;
}

export const CommunityRecommendationsSection = ({ returnPath = '/home' }: CommunityRecommendationsSectionProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const recommendations = useAppSelector(selectCommunityRecommendations);
  const loading = useAppSelector(selectCommunityLoading);
  const contentTypeFilter = useAppSelector(selectContentTypeFilter);
  const activeProfile = useAppSelector(selectActiveProfile);
  const profileShows = useAppSelector(selectShows);
  const profileMovies = useAppSelector(selectMovies);

  const [detailsRec, setDetailsRec] = useState<CommunityRecommendation | null>(null);
  const [favoritingIds, setFavoritingIds] = useState<Set<string>>(new Set());
  const processingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    dispatch(fetchCommunityRecommendations({ contentType: contentTypeFilter ?? undefined }));
  }, [dispatch, contentTypeFilter]);

  const handleFilterChange = (_: React.MouseEvent<HTMLElement>, value: RatingContentType | null) => {
    dispatch(setContentTypeFilter(value));
  };

  const isFavorited = (rec: CommunityRecommendation): boolean => {
    if (rec.contentType === 'show') {
      return profileShows.some((s) => s.tmdbId === rec.tmdbId);
    }
    return profileMovies.some((m) => m.tmdbId === rec.tmdbId);
  };

  const handleCardClick = (rec: CommunityRecommendation) => {
    if (!activeProfile || !isFavorited(rec)) return;
    if (rec.contentType === 'show') {
      navigate(`/shows/${rec.contentId}/${activeProfile.id}`, { state: { returnPath } });
    } else {
      navigate(`/movies/${rec.contentId}/${activeProfile.id}`, { state: { returnPath } });
    }
  };

  const handleAddFavorite = useCallback(
    async (rec: CommunityRecommendation, event: React.MouseEvent) => {
      event.stopPropagation();
      if (!activeProfile) return;

      const key = `${rec.contentType}-${rec.contentId}`;
      if (processingRef.current.has(key)) return;

      processingRef.current.add(key);
      setFavoritingIds((prev) => new Set(prev).add(key));

      try {
        if (rec.contentType === 'show') {
          await dispatch(addShowFavorite({ profileId: activeProfile.id, showId: rec.tmdbId }));
        } else {
          await dispatch(addMovieFavorite({ profileId: activeProfile.id, movieId: rec.tmdbId }));
        }
      } finally {
        processingRef.current.delete(key);
        setFavoritingIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [dispatch, activeProfile],
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h6">Community Picks</Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={contentTypeFilter}
          onChange={handleFilterChange}
        >
          <ToggleButton value={null as any}>All</ToggleButton>
          <ToggleButton value="show">Shows</ToggleButton>
          <ToggleButton value="movie">Movies</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : recommendations.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          No community recommendations yet. Be the first to recommend something!
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { height: 4 },
          }}
        >
          {recommendations.map((rec) => {
            const favorited = isFavorited(rec);
            const key = `${rec.contentType}-${rec.contentId}`;
            const addingFavorite = favoritingIds.has(key);

            return (
              <Card key={key} sx={{ minWidth: 140, maxWidth: 160, flexShrink: 0 }}>
                <Tooltip
                  title={favorited ? '' : 'Add to your favorites to view details'}
                  disableHoverListener={favorited}
                >
                  <span style={{ display: 'block' }}>
                    <CardActionArea
                      onClick={() => handleCardClick(rec)}
                      disabled={!favorited}
                      sx={{ '&.Mui-disabled': { opacity: 1 } }}
                    >
                      <Badge
                        badgeContent={rec.recommendationCount}
                        color="primary"
                        sx={{ width: '100%' }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={buildTMDBImagePath(rec.posterImage)}
                          alt={rec.contentTitle}
                          sx={{ objectFit: 'cover', width: '100%', opacity: favorited ? 1 : 0.75 }}
                        />
                      </Badge>
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Typography
                          variant="caption"
                          display="block"
                          noWrap
                          title={rec.contentTitle}
                          fontWeight="medium"
                        >
                          {rec.contentTitle}
                        </Typography>
                        {rec.averageRating !== null && rec.ratingCount > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Rating value={rec.averageRating} max={5} readOnly size="small" precision={0.5} />
                            <Typography variant="caption" color="text.secondary">
                              ({rec.ratingCount})
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </span>
                </Tooltip>

                <Box sx={{ px: 1, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {rec.messageCount > 0 ? (
                    <Link
                      component="button"
                      variant="caption"
                      onClick={() => setDetailsRec(rec)}
                      sx={{ textAlign: 'left' }}
                    >
                      {rec.messageCount === 1 ? '1 review' : `${rec.messageCount} reviews`}
                    </Link>
                  ) : (
                    <span />
                  )}
                  <Tooltip title={favorited ? 'In your favorites' : 'Add to favorites'}>
                    <span>
                      <IconButton
                        size="small"
                        onClick={(e) => !favorited && handleAddFavorite(rec, e)}
                        disabled={addingFavorite || favorited}
                        sx={{
                          p: 0.5,
                          '&.Mui-disabled': { opacity: favorited ? 1 : 0.5 },
                        }}
                        aria-label={favorited ? 'Already in favorites' : 'Add to favorites'}
                      >
                        {addingFavorite ? (
                          <CircularProgress size={16} />
                        ) : favorited ? (
                          <StarIcon fontSize="small" color="primary" />
                        ) : (
                          <StarBorderIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}

      {detailsRec && (
        <RecommendationDetailsDialog
          open={true}
          contentType={detailsRec.contentType}
          contentId={detailsRec.contentId}
          contentTitle={detailsRec.contentTitle}
          onClose={() => setDetailsRec(null)}
        />
      )}
    </Box>
  );
};
