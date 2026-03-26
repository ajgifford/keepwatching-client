import { useEffect, useRef, useState } from 'react';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ClearIcon from '@mui/icons-material/Clear';
import HistoryIcon from '@mui/icons-material/History';
import MovieIcon from '@mui/icons-material/Movie';
import ReplayIcon from '@mui/icons-material/Replay';
import TvIcon from '@mui/icons-material/Tv';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  Pagination,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useDateFormatters } from '../../app/hooks/useDateFormatters';
import { selectActiveProfile } from '../../app/slices/activeProfileSlice';
import {
  clearHistory,
  fetchWatchHistory,
  selectWatchHistoryContentType,
  selectWatchHistoryDateFrom,
  selectWatchHistoryDateTo,
  selectWatchHistoryError,
  selectWatchHistoryIsPriorWatchOnly,
  selectWatchHistoryItems,
  selectWatchHistoryLoading,
  selectWatchHistoryPage,
  selectWatchHistoryPageSize,
  selectWatchHistorySearchQuery,
  selectWatchHistorySortOrder,
  selectWatchHistoryTotalCount,
} from '../../app/slices/watchHistorySlice';
import { calculateRuntimeDisplay } from '../utility/contentUtility';
import { WatchHistoryItem } from '@ajgifford/keepwatching-types';
import { ErrorComponent, LoadingComponent, buildTMDBImagePath } from '@ajgifford/keepwatching-ui';

type ContentTypeFilter = 'all' | 'episode' | 'movie';

function WatchHistory() {
  const dispatch = useAppDispatch();
  const formatters = useDateFormatters();
  const activeProfile = useAppSelector(selectActiveProfile);

  const items = useAppSelector(selectWatchHistoryItems);
  const totalCount = useAppSelector(selectWatchHistoryTotalCount);
  const page = useAppSelector(selectWatchHistoryPage);
  const pageSize = useAppSelector(selectWatchHistoryPageSize);
  const loading = useAppSelector(selectWatchHistoryLoading);
  const error = useAppSelector(selectWatchHistoryError);
  const contentType = useAppSelector(selectWatchHistoryContentType);
  const sortOrder = useAppSelector(selectWatchHistorySortOrder);
  const dateFrom = useAppSelector(selectWatchHistoryDateFrom);
  const dateTo = useAppSelector(selectWatchHistoryDateTo);
  const isPriorWatchOnly = useAppSelector(selectWatchHistoryIsPriorWatchOnly);
  const searchQuery = useAppSelector(selectWatchHistorySearchQuery);

  // Local state for the search input — debounced before dispatching
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [dateError, setDateError] = useState<string | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasActiveFilters =
    contentType !== 'all' ||
    sortOrder !== 'desc' ||
    !!dateFrom ||
    !!dateTo ||
    isPriorWatchOnly ||
    !!searchQuery;

  useEffect(() => {
    return () => {
      dispatch(clearHistory());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!activeProfile) return;
    dispatch(
      fetchWatchHistory({
        profileId: activeProfile.id,
        page: 1,
        pageSize,
        contentType,
        sortOrder,
        dateFrom,
        dateTo,
        isPriorWatchOnly,
        searchQuery,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile, dispatch, pageSize]);

  const dispatchWithFilters = (overrides: {
    contentType?: ContentTypeFilter;
    sortOrder?: 'asc' | 'desc';
    dateFrom?: string | null;
    dateTo?: string | null;
    isPriorWatchOnly?: boolean;
    searchQuery?: string;
  }) => {
    if (!activeProfile) return;
    dispatch(
      fetchWatchHistory({
        profileId: activeProfile.id,
        page: 1,
        pageSize,
        contentType,
        sortOrder,
        dateFrom,
        dateTo,
        isPriorWatchOnly,
        searchQuery,
        ...overrides,
      }),
    );
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    if (!activeProfile) return;
    dispatch(
      fetchWatchHistory({
        profileId: activeProfile.id,
        page: newPage,
        pageSize,
        contentType,
        sortOrder,
        dateFrom,
        dateTo,
        isPriorWatchOnly,
        searchQuery,
      }),
    );
  };

  const handleContentTypeChange = (_: React.MouseEvent<HTMLElement>, value: ContentTypeFilter | null) => {
    if (value !== null) dispatchWithFilters({ contentType: value });
  };

  const handleSortToggle = () => {
    dispatchWithFilters({ sortOrder: sortOrder === 'desc' ? 'asc' : 'desc' });
  };

  const handleDateFromChange = (value: string) => {
    const newDateFrom = value || null;
    if (newDateFrom && dateTo && newDateFrom > dateTo) {
      setDateError('Start date must be on or before end date');
      return;
    }
    setDateError(null);
    dispatchWithFilters({ dateFrom: newDateFrom });
  };

  const handleDateToChange = (value: string) => {
    const newDateTo = value || null;
    if (dateFrom && newDateTo && dateFrom > newDateTo) {
      setDateError('End date must be on or after start date');
      return;
    }
    setDateError(null);
    dispatchWithFilters({ dateTo: newDateTo });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      dispatchWithFilters({ searchQuery: value });
    }, 400);
  };

  const handleSearchClear = () => {
    setSearchInput('');
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    dispatchWithFilters({ searchQuery: '' });
  };

  const handlePriorWatchToggle = () => {
    dispatchWithFilters({ isPriorWatchOnly: !isPriorWatchOnly });
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setDateError(null);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    dispatchWithFilters({
      contentType: 'all',
      sortOrder: 'desc',
      dateFrom: null,
      dateTo: null,
      isPriorWatchOnly: false,
      searchQuery: '',
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const buildItemTitle = (item: WatchHistoryItem) => {
    if (item.contentType === 'episode' && item.parentTitle) {
      return (
        <>
          <Typography variant="subtitle1" fontWeight="medium" component="span">
            {item.parentTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 0.5 }}>
            {` • S${item.seasonNumber}E${item.episodeNumber} • ${item.title}`}
          </Typography>
        </>
      );
    }
    return (
      <Typography variant="subtitle1" fontWeight="medium" component="span">
        {item.title}
      </Typography>
    );
  };

  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent error={error} />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
      <Box sx={{ px: { xs: 2, md: 3 }, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <HistoryIcon />
          <Typography variant="h5" fontWeight="bold">
            Watch History
          </Typography>
          {totalCount > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({totalCount} entries)
            </Typography>
          )}
        </Box>

        {/* Filters: single row on md+, wraps on smaller screens */}
        <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <ToggleButtonGroup
            value={contentType}
            exclusive
            onChange={handleContentTypeChange}
            size="small"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="episode">
              <TvIcon fontSize="small" sx={{ mr: 0.5 }} />
              Shows
            </ToggleButton>
            <ToggleButton value="movie">
              <MovieIcon fontSize="small" sx={{ mr: 0.5 }} />
              Movies
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="From"
            type="date"
            size="small"
            value={dateFrom ?? ''}
            onChange={(e) => handleDateFromChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, input: { endAdornment: dateFrom ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => handleDateFromChange('')} edge="end">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined } }}
            error={!!dateError}
            sx={{ width: 170 }}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            value={dateTo ?? ''}
            onChange={(e) => handleDateToChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, input: { endAdornment: dateTo ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => handleDateToChange('')} edge="end">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined } }}
            error={!!dateError}
            helperText={dateError ?? undefined}
            sx={{ width: 170 }}
          />

          <TextField
            label="Search by show / movie title"
            size="small"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            slotProps={{
              input: {
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleSearchClear} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
            sx={{ width: { xs: '100%', sm: 260 } }}
          />

          <ToggleButton
            value="priorWatch"
            selected={isPriorWatchOnly}
            onChange={handlePriorWatchToggle}
            size="small"
          >
            Prior Watches Only
          </ToggleButton>

          <Tooltip title={sortOrder === 'desc' ? 'Showing newest first — click for oldest first' : 'Showing oldest first — click for newest first'}>
            <IconButton onClick={handleSortToggle} size="small" color={sortOrder === 'asc' ? 'primary' : 'default'}>
              {sortOrder === 'desc' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {hasActiveFilters && (
            <Button size="small" onClick={handleClearAllFilters} sx={{ textTransform: 'none' }}>
              Clear filters
            </Button>
          )}
        </Stack>

        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <HistoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No watch history yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Episodes and movies you watch will appear here.
            </Typography>
          </Box>
        ) : (
          <>
            <List disablePadding>
              {items.map((item, index) => (
                <HistoryListItem key={item.historyId} item={item} index={index} formatters={formatters} buildItemTitle={buildItemTitle} />
              ))}
            </List>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

interface HistoryListItemProps {
  item: WatchHistoryItem;
  index: number;
  formatters: ReturnType<typeof useDateFormatters>;
  buildItemTitle: (item: WatchHistoryItem) => React.ReactNode;
}

function HistoryListItem({ item, index, formatters, buildItemTitle }: HistoryListItemProps) {
  return (
    <>
      <ListItem
        sx={{
          px: 0,
          py: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          bgcolor: index % 2 === 0 ? 'background.default' : 'background.paper',
          borderRadius: 1,
        }}
      >
        <Box
          component="img"
          src={buildTMDBImagePath(item.posterImage, 'w185')}
          alt={item.title}
          sx={{
            width: 48,
            height: 72,
            objectFit: 'cover',
            borderRadius: 1,
            flexShrink: 0,
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = 'https://placehold.co/185x278/gray/white?text=No+Image';
          }}
        />

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
            {buildItemTitle(item)}
            {item.watchNumber > 1 && (
              <Tooltip title={`Watched ${item.watchNumber} times`}>
                <Chip
                  icon={<ReplayIcon sx={{ fontSize: '0.85rem !important' }} />}
                  label={`×${item.watchNumber}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Tooltip>
            )}
            {item.isPriorWatch && (
              <Chip label="Prior Watch" size="small" variant="outlined" color="default" />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary">
            {formatters.activityDate(item.watchedAt.slice(0, 10))}
            {item.runtime ? ` • ${calculateRuntimeDisplay(item.runtime)}` : ''}
          </Typography>
        </Box>
      </ListItem>
      {index < 999 && <Divider />}
    </>
  );
}

export default WatchHistory;
