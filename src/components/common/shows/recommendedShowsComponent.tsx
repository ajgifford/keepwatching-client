import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  fetchRecommendedShows,
  selectRecommendedShows,
  selectRecommendedShowsLoading,
} from '../../../app/slices/activeShowSlice';
import { MediaCard } from '../media/mediaCard';
import { ScrollableMediaRow } from '../media/scrollableMediaRow';
import { SimilarOrRecommendedShow } from '@ajgifford/keepwatching-types';

interface RecommendedShowsComponentProps {
  showId: number;
  profileId: number;
}

export const RecommendedShowsComponent = ({ showId, profileId }: RecommendedShowsComponentProps) => {
  const dispatch = useAppDispatch();
  const recommendedShows = useAppSelector(selectRecommendedShows);
  const recommendedShowsLoading = useAppSelector(selectRecommendedShowsLoading);

  useEffect(() => {
    dispatch(fetchRecommendedShows({ profileId, showId }));
  }, [dispatch, profileId, showId]);

  return (
    <ScrollableMediaRow
      title="Recommended Shows"
      items={recommendedShows}
      isLoading={recommendedShowsLoading}
      emptyMessage="No recommended shows found"
      renderItem={(show: SimilarOrRecommendedShow) => <MediaCard item={show} searchType="shows" />}
      getItemKey={(show) => show.id}
    />
  );
};
