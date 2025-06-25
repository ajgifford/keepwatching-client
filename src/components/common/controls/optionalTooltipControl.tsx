import { Tooltip } from '@mui/material';

interface MaybeTooltipProps {
  key: string;
  title: string;
  disabled: boolean;
  children: React.ReactElement;
}

export const OptionalTooltipControl: React.FC<MaybeTooltipProps> = ({ key, title, disabled, children }) =>
  disabled ? (
    children
  ) : (
    <Tooltip key={key} title={title}>
      {children}
    </Tooltip>
  );
