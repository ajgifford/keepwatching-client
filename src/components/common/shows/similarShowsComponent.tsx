import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchSimilarShows, selectSimilarShows, selectSimilarShowsLoading } from '../../../app/slices/activeShowSlice';
import { MediaCard } from '../media/mediaCard';
import { ScrollableMediaRow } from '../media/scrollableMediaRow';

interface SimilarShowsComponentProps {
  showId: number;
  profileId: number;
}

export const SimilarShowsComponent = ({ showId, profileId }: SimilarShowsComponentProps) => {
  const dispatch = useAppDispatch();
  const similarShows = useAppSelector(selectSimilarShows);
  const similarShowsLoading = useAppSelector(selectSimilarShowsLoading);

  useEffect(() => {
    dispatch(fetchSimilarShows({ profileId, showId }));
  }, [dispatch, profileId, showId]);

  return (
    <ScrollableMediaRow
      title="Similar Shows"
      items={similarShows}
      isLoading={similarShowsLoading}
      emptyMessage="No similar shows found"
      renderItem={(show) => <MediaCard item={show} searchType="shows" />}
    />
  );
};
