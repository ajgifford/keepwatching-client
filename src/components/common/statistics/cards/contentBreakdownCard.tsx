import { Box, Card, CardContent, Grid, LinearProgress, Typography } from '@mui/material';

interface ContentBreakdownItem {
  label: string;
  total: number;
  progress: number;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

interface ContentBreakdownCardProps {
  title: string;
  items: ContentBreakdownItem[];
}

export default function ContentBreakdownCard({ title, items }: ContentBreakdownCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12 }}>
            {items.map((item, index) => (
              <Box key={index} sx={{ mb: index < items.length - 1 ? 2 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body1">{item.label}</Typography>
                  <Typography variant="body1">{item.total}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.progress}
                  color={item.color}
                  sx={{ height: 8, borderRadius: 4, mb: index < items.length - 1 ? 2 : 0 }}
                />
              </Box>
            ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
