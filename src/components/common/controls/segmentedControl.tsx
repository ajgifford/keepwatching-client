import React from 'react';

import { Box, Button, ButtonGroup, SxProps, Theme, useTheme } from '@mui/material';

export interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  sx?: SxProps<Theme>;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  fullWidth = false,
  size = 'medium',
  variant = 'outlined',
  color = 'primary',
  sx = {},
}) => {
  const theme = useTheme();

  const getButtonStyles = (option: SegmentedControlOption, isSelected: boolean) => {
    const baseStyles = {
      borderRadius: 0,
      textTransform: 'none' as const,
      fontWeight: isSelected ? 600 : 400,
      minWidth: fullWidth ? 'auto' : 140, // Increased from 120 to 140
      flex: fullWidth ? 1 : 'none',
      position: 'relative' as const,
      zIndex: isSelected ? 2 : 1,
      transition: 'all 0.2s ease-in-out',
      whiteSpace: 'nowrap' as const, // Prevent text wrapping
      ...(variant === 'outlined' && {
        borderColor: theme.palette[color].main,
        backgroundColor: isSelected ? theme.palette[color].main : 'transparent',
        color: isSelected ? theme.palette[color].contrastText : theme.palette[color].main,
        '&:hover': {
          backgroundColor: isSelected ? theme.palette[color].dark : theme.palette[color].light + '20',
          borderColor: theme.palette[color].main,
        },
      }),
      ...(variant === 'contained' && {
        backgroundColor: isSelected ? theme.palette[color].main : theme.palette.grey[200],
        color: isSelected ? theme.palette[color].contrastText : theme.palette.text.primary,
        border: 'none',
        '&:hover': {
          backgroundColor: isSelected ? theme.palette[color].dark : theme.palette.grey[300],
        },
      }),
    };

    return baseStyles;
  };

  const getGroupStyles = () => {
    const borderRadius = typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 2 : 8; // fallback value

    return {
      '& .MuiButton-root': {
        borderRadius: 0,
      },
      '& .MuiButton-root:first-of-type': {
        borderTopLeftRadius: borderRadius,
        borderBottomLeftRadius: borderRadius,
      },
      '& .MuiButton-root:last-of-type': {
        borderTopRightRadius: borderRadius,
        borderBottomRightRadius: borderRadius,
      },
      '& .MuiButton-root:not(:last-of-type)': {
        borderRightWidth: variant === 'outlined' ? 0 : 1,
      },
      ...sx,
    };
  };

  return (
    <Box sx={{ display: 'inline-block' }}>
      <ButtonGroup variant={variant} color={color} size={size} fullWidth={fullWidth} sx={getGroupStyles()}>
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <Button
              key={option.value}
              onClick={() => !option.disabled && onChange(option.value)}
              disabled={option.disabled}
              sx={getButtonStyles(option, isSelected)}
            >
              {option.label}
            </Button>
          );
        })}
      </ButtonGroup>
    </Box>
  );
};

export const SEARCH_TYPE_OPTIONS: SegmentedControlOption[] = [
  { value: 'shows', label: 'TV Shows' },
  { value: 'movies', label: 'Movies' },
];

export const DISCOVER_TYPE_OPTIONS: SegmentedControlOption[] = [
  { value: 'series', label: 'TV Shows' },
  { value: 'movies', label: 'Movies' },
];

export const SERVICE_OPTIONS: SegmentedControlOption[] = [
  { value: 'netflix', label: 'Netflix' },
  { value: 'disney', label: 'Disney+' },
  { value: 'hbo', label: 'Max' },
  { value: 'apple', label: 'Apple TV+' },
  { value: 'prime', label: 'Prime Video' },
];

export const FILTER_OPTIONS: SegmentedControlOption[] = [
  { value: 'top', label: 'Top Rated' },
  { value: 'new', label: 'New Releases' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'expiring', label: 'Expiring Soon' },
];
