import { useTheme } from '@mui/material';

import { ChartDataItem } from '../utils/distributionTypes';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DistributionBarChartProps {
  data: ChartDataItem[];
  height?: number;
  color?: string;
}

const DistributionBarChart = ({ data, height = 300, color }: DistributionBarChartProps) => {
  const theme = useTheme();
  const barColor = color || theme.palette.primary.main;

  const validData = data && data.length > 0 ? data : [{ name: 'No Data', value: 0 }];

  const maxLabelLength = Math.max(...validData.map((item) => item.name.length));
  const leftMargin = Math.min(Math.max(30, maxLabelLength * 6), 120);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={validData} layout="vertical" margin={{ top: 20, right: 30, left: leftMargin, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" />
        <Tooltip
          formatter={(value: number) => [`${value} shows/movies`]}
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
        />
        <Bar
          dataKey="value"
          fill={barColor}
          name="Count"
          label={{ position: 'right', fill: '#333', fontSize: 12 }}
          isAnimationActive={true}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DistributionBarChart;
