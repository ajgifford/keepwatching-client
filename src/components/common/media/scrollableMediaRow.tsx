import { ReactNode, useEffect, useRef, useState } from 'react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';

interface ScrollableMediaRowProps<T> {
  title: string;
  items: T[];
  isLoading: boolean;
  renderItem: (item: T) => ReactNode;
  emptyMessage?: string;
  onLoadMore?: () => void;
}

export function ScrollableMediaRow<T>({
  title,
  items,
  isLoading,
  renderItem,
  emptyMessage = 'No items found',
  onLoadMore,
}: ScrollableMediaRowProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check if we need to show arrows on mount and window resize
  useEffect(() => {
    const checkScrollability = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowRightArrow(scrollWidth > clientWidth);
      }
    };

    // Run the check after a small delay to ensure content is rendered
    const timer = setTimeout(checkScrollability, 100);

    // Also check on window resize
    window.addEventListener('resize', checkScrollability);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [items]);

  // Handle scrolling
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer

      // Load more items when we're close to the end
      if (onLoadMore && scrollLeft > scrollWidth - clientWidth - 300) {
        onLoadMore();
      }
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.querySelector('.media-item')?.clientWidth || 200;
      container.scrollBy({ left: -itemWidth * 2, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.querySelector('.media-item')?.clientWidth || 200;
      container.scrollBy({ left: itemWidth * 2, behavior: 'smooth' });
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!items.length) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">{title}</Typography>
      </Box>

      <Box sx={{ position: 'relative' }}>
        {/* Left scroll arrow */}
        {showLeftArrow && (
          <IconButton
            aria-label="scroll left"
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
            onClick={scrollLeft}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}

        {/* Scrollable container */}
        <Box
          ref={scrollContainerRef}
          onScroll={handleScroll}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            scrollbarWidth: 'none', // Firefox
            '&::-webkit-scrollbar': { display: 'none' }, // Chrome
            mx: 1,
            p: 1,
          }}
        >
          {items.map((item, index) => (
            <Box key={index} className="media-item" sx={{ mx: 1, flexShrink: 0 }}>
              {renderItem(item)}
            </Box>
          ))}

          {/* Loading indicator at the end if more items are being loaded */}
          {isLoading && items.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '100px',
                mx: 2,
              }}
            >
              <CircularProgress size={30} />
            </Box>
          )}
        </Box>

        {/* Right scroll arrow */}
        {showRightArrow && (
          <IconButton
            aria-label="scroll right"
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
            onClick={scrollRight}
          >
            <ChevronRightIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
