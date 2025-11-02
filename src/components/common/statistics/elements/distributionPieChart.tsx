import { ChartDataItem } from '../utils/distributionTypes';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DistributionPieChartProps {
  data: ChartDataItem[];
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = ['#4CAF50', '#FFC107', '#F44336', '#2196F3', '#9C27B0', '#FF9800'];

const DistributionPieChart = ({ data, height = 300, colors = DEFAULT_COLORS }: DistributionPieChartProps) => {
  const validData = data && data.length > 0 ? data : [{ name: 'No Data', value: 1 }];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={validData}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
          nameKey="name"
        >
          {validData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value} shows/movies`]}
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DistributionPieChart;
