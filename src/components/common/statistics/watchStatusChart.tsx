import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface WatchStatusDataItem {
  name: string;
  watched: number;
  watching: number;
  notWatched: number;
  upToDate?: number;
  [key: string]: string | number | undefined;
}

interface WatchStatusChartProps {
  data: WatchStatusDataItem[];
  height?: number;
}

const WATCH_STATUS_COLORS = {
  watched: '#4CAF50',
  watching: '#FFC107',
  notWatched: '#F44336',
  upToDate: '#2196F3',
};

const WatchStatusChart = ({ data, height = 300 }: WatchStatusChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="watched" stackId="a" fill={WATCH_STATUS_COLORS.watched} name="Watched" />
        <Bar dataKey="upToDate" stackId="a" fill={WATCH_STATUS_COLORS.upToDate} name="Up To Date" />
        <Bar dataKey="watching" stackId="a" fill={WATCH_STATUS_COLORS.watching} name="Watching" />
        <Bar dataKey="notWatched" stackId="a" fill={WATCH_STATUS_COLORS.notWatched} name="Not Watched" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WatchStatusChart;
