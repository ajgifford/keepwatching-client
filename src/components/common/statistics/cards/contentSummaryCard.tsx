import { ReactNode } from 'react';

import { Card, CardContent, Typography } from '@mui/material';

interface ContentSummaryCardProps {
  title: string;
  children: ReactNode;
}

export default function ContentSummaryCard({ title, children }: ContentSummaryCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}
