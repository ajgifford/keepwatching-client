# Statistics Component Architecture

This document provides an overview of the refactored statistics components for the KeepWatching app.

## Overview

The statistics module has been refactored to reduce duplication and improve maintainability by:

1. Creating shared, reusable components
2. Extracting common logic into custom hooks
3. Implementing utility functions for repeated calculations
4. Using type guards and common interfaces

## Component Hierarchy

```
BaseStatisticsDashboard
├── AccountStatisticsDashboard
│   ├── ContentBreakdownCard
│   └── ContentSummaryCard
├── ProfileStatisticsDashboard
│   └── ShowProgressCard
├── StatisticsSummaryCard
├── DistributionPieChart
├── DistributionBarChart
└── WatchStatusChart
```

## Core Components

### BaseStatisticsDashboard

The base component that handles common layout, loading states, and chart rendering for both account and profile statistics. It accepts customizable content sections and summary card props.

### ContentBreakdownCard

Displays content metrics (shows, movies, episodes) with progress bars to visualize completion status.

### ShowProgressCard

Renders a list of shows with their watch progress, sorted by completion percentage. Used in the profile dashboard for "Currently Watching" shows.

### ContentSummaryCard

A wrapper component for summary information with consistent styling.

### StatisticsSummaryCard

Presents key metrics with a progress bar and summary statistics.

## Utilities and Hooks

### useStatisticsData

A custom hook that extracts common data processing logic for:
- Watch status charts
- Genre distribution
- Streaming service distribution

### statisticsUtils

Utility functions to:
- Generate summary card props
- Type guards to differentiate between account and profile statistics
- Helper functions for data formatting

## How to Use

### For Account Statistics

```tsx
import { AccountStatisticsDashboard } from '../common/statistics/AccountStatisticsDashboard';

// In your component:
<AccountStatisticsDialog
  open={open}
  title={title}
  accountId={accountId}
  onClose={onClose}
/>

// In the dialog:
<AccountStatisticsDashboard 
  statistics={statistics} 
  isLoading={loading} 
/>
```

### For Profile Statistics

```tsx
import { ProfileStatisticsDashboard } from '../common/statistics/ProfileStatisticsDashboard';

// In your component:
<ProfileStatisticsDialog
  open={open}
  title={title}
  accountId={accountId}
  profileId={profileId}
  onClose={onClose}
/>

// In the dialog:
<ProfileStatisticsDashboard 
  statistics={statistics} 
  isLoading={loading} 
/>
```

## Extensibility

To add new statistics visualizations:

1. Create a new component that renders the specific visualization
2. Update the appropriate dashboard to include your component
3. Extract any reusable logic to the utilities or hooks

## Type Safety

The architecture uses TypeScript to ensure type safety:

- Type guards to differentiate between statistics types
- Proper prop typing for all components
- Reusable interfaces for common data structures
