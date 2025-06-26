import { Tooltip } from '@mui/material';

interface OptionalTooltipProps {
  identifier: string;
  title: string;
  disabled: boolean;
  children: React.ReactElement;
}

export const OptionalTooltipControl: React.FC<OptionalTooltipProps> = ({ identifier, title, disabled, children }) =>
  disabled ? (
    children
  ) : (
    <Tooltip key={identifier} title={title}>
      {children}
    </Tooltip>
  );
