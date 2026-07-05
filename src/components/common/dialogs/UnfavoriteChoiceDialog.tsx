import { TwoChoiceDialog } from './TwoChoiceDialog';

export interface UnfavoriteChoiceDialogProps {
  open: boolean;
  contentTitle: string;
  contentLabel: 'show' | 'movie';
  onKeepHistory: () => void;
  onRemoveEntirely: () => void;
  onClose: () => void;
}

/**
 * Shown when a user removes a show/movie from favorites. Un-favoriting always removes
 * the watch status, but the user gets an explicit choice over whether the underlying
 * watch history sticks around.
 */
export const UnfavoriteChoiceDialog = ({
  open,
  contentTitle,
  contentLabel,
  onKeepHistory,
  onRemoveEntirely,
  onClose,
}: UnfavoriteChoiceDialogProps) => {
  return (
    <TwoChoiceDialog
      open={open}
      title={`Remove '${contentTitle}' from favorites?`}
      body={`Removing this ${contentLabel} won't erase your watch history unless you choose to. Keep it if you might come back to this ${contentLabel} later, or remove it completely to start over next time.`}
      primaryLabel="Keep watch history"
      onPrimary={onKeepHistory}
      secondaryLabel="Remove entirely"
      onSecondary={onRemoveEntirely}
      onClose={onClose}
      secondaryColor="error"
    />
  );
};

export default UnfavoriteChoiceDialog;
