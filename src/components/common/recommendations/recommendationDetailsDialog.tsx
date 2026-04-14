import React, { useEffect, useState } from 'react';

import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Rating,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import axiosInstance from '../../../app/api/axiosInstance';
import { RatingContentType, RecommendationDetail, RecommendationDetailsResponse } from '@ajgifford/keepwatching-types';
import { AxiosResponse } from 'axios';

interface RecommendationDetailsDialogProps {
  open: boolean;
  contentType: RatingContentType;
  contentId: number;
  contentTitle: string;
  onClose: () => void;
}

function RecommendationDetailsDialog({
  open,
  contentType,
  contentId,
  contentTitle,
  onClose,
}: RecommendationDetailsDialogProps) {
  const [details, setDetails] = useState<RecommendationDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axiosInstance
      .get<RecommendationDetailsResponse>(`/community/recommendations/${contentType}/${contentId}`)
      .then((res: AxiosResponse<RecommendationDetailsResponse>) => setDetails(res.data.details))
      .finally(() => setLoading(false));
  }, [open, contentType, contentId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Reviews — {contentTitle}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ maxHeight: 480 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : details.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No reviews found.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {details.map((detail, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider />}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  {detail.rating && (
                    <Rating value={detail.rating} max={5} readOnly size="small" precision={0.5} sx={{ flexShrink: 0, pt: 0.25 }} />
                  )}
                  {detail.message && (
                    <Typography variant="body2" color="text.secondary">
                      "{detail.message}"
                    </Typography>
                  )}
                </Box>
              </React.Fragment>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default RecommendationDetailsDialog;
