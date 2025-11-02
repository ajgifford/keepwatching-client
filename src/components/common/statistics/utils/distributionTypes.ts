export interface ChartDataItem {
  name: string;
  value: number;
}

export interface GenreDistribution {
  [genre: string]: number;
}

export interface ServiceDistribution {
  [service: string]: number;
}

export function convertToChartData(
  distribution: GenreDistribution | ServiceDistribution,
  limit: number = 6
): ChartDataItem[] {
  return Object.entries(distribution)
    .filter(([value]) => value && value.trim() !== '')
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function getTopItem(distribution: GenreDistribution | ServiceDistribution): string {
  if (Object.keys(distribution).length === 0) return 'None';

  const topItem = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0];

  return topItem[0];
}

export function getTopItemPercentage(distribution: GenreDistribution | ServiceDistribution, total: number): number {
  if (total === 0 || Object.keys(distribution).length === 0) return 0;

  const topItem = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0];

  return Math.round((topItem[1] / total) * 100);
}
