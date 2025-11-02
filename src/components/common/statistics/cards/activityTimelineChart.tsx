import { useMemo } from 'react';
import { useState } from 'react';

import { Box, Card, CardContent, Tab, Tabs, Typography, useTheme } from '@mui/material';

import { WatchingActivityTimeline } from '@ajgifford/keepwatching-types';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ActivityTimelineChartProps {
  timeline?: WatchingActivityTimeline | null;
  isLoading?: boolean;
}

const ActivityTimelineChart = ({ timeline, isLoading = false }: ActivityTimelineChartProps) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const dailyChartData = useMemo(() => {
    if (!timeline?.dailyActivity) return [];
    return timeline.dailyActivity.map((day) => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      episodes: day.episodesWatched,
      shows: day.showsWatched,
    }));
  }, [timeline?.dailyActivity]);

  const weeklyChartData = useMemo(() => {
    if (!timeline?.weeklyActivity) return [];
    return timeline.weeklyActivity.map((week) => ({
      week: new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      episodes: week.episodesWatched,
    }));
  }, [timeline?.weeklyActivity]);

  const monthlyChartData = useMemo(() => {
    if (!timeline?.monthlyActivity) return [];
    return timeline.monthlyActivity.map((month) => {
      const [year, monthNum] = month.month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        episodes: month.episodesWatched,
        movies: month.moviesWatched,
      };
    });
  }, [timeline?.monthlyActivity]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activity Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            Loading...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!timeline) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Activity Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No activity data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Activity Timeline
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Daily" />
            <Tab label="Weekly" />
            <Tab label="Monthly" />
          </Tabs>
        </Box>

        {/* Daily Chart */}
        {activeTab === 0 && (
          <Box>
            {dailyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" minHeight={300} height={400}>
                <AreaChart data={dailyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="episodesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} reversed />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="episodes"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#episodesGradient)"
                    name="Episodes"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                No daily activity data available
              </Typography>
            )}
          </Box>
        )}

        {/* Weekly Chart */}
        {activeTab === 1 && (
          <Box>
            {weeklyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" minHeight={300} height={400}>
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} reversed />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                  <Legend />
                  <Bar dataKey="episodes" fill={theme.palette.secondary.main} name="Episodes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                No weekly activity data available
              </Typography>
            )}
          </Box>
        )}

        {/* Monthly Chart */}
        {activeTab === 2 && (
          <Box>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" minHeight={300} height={400}>
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} reversed />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                  <Legend />
                  <Bar dataKey="episodes" fill={theme.palette.primary.main} name="Episodes" />
                  <Bar dataKey="movies" fill={theme.palette.secondary.main} name="Movies" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                No monthly activity data available
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityTimelineChart;
