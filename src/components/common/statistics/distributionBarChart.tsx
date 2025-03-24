import { useTheme } from '@mui/material';

import { ChartDataItem } from './distributionTypes';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DistributionBarChartProps {
  data: ChartDataItem[];
  height?: number;
  color?: string;
  vertical?: boolean;
}

const DistributionBarChart = ({ data, height = 300, color, vertical = true }: DistributionBarChartProps) => {
  const theme = useTheme();
  const barColor = color || theme.palette.primary.main;

  // Ensure we have valid data to display
  const validData = data && data.length > 0 ? data : [{ name: 'No Data', value: 0 }];

  // Calculate appropriate margins based on data labels
  const maxLabelLength = Math.max(...validData.map((item) => item.name.length));
  const leftMargin = vertical ? Math.min(Math.max(30, maxLabelLength * 6), 120) : 20;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={validData}
        layout={vertical ? 'vertical' : 'horizontal'}
        margin={{ top: 20, right: 30, left: leftMargin, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {vertical ? (
          <>
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={leftMargin} tick={{ fontSize: 12 }} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" />
            <YAxis type="number" />
          </>
        )}
        <Tooltip
          formatter={(value: number) => [`${value} items`, 'Count']}
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
        />
        <Legend />
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
