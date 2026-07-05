import { TwoChoiceDialog } from './TwoChoiceDialog';

export interface RefavoriteChoiceDialogProps {
  open: boolean;
  contentTitle: string;
  contentLabel: 'show' | 'movie';
  onRestore: () => void;
  onStartFresh: () => void;
  onClose: () => void;
}

/**
 * Shown when re-favoriting a show/movie that still has watch history left over from a
 * previous favorite/unfavorite-keeping-history cycle. Mirrors UnfavoriteChoiceDialog's
 * choice: pick up where that history left off, or start tracking from scratch.
 */
export const RefavoriteChoiceDialog = ({
  open,
  contentTitle,
  contentLabel,
  onRestore,
  onStartFresh,
  onClose,
}: RefavoriteChoiceDialogProps) => {
  return (
    <TwoChoiceDialog
      open={open}
      title={`You've watched '${contentTitle}' before`}
      body={`We found earlier watch history for this ${contentLabel}. Restore your previous watch status from that history, or start fresh as if this is the first time.`}
      primaryLabel="Restore previous watch status"
      onPrimary={onRestore}
      secondaryLabel="Start fresh"
      onSecondary={onStartFresh}
      onClose={onClose}
    />
  );
};

export default RefavoriteChoiceDialog;
