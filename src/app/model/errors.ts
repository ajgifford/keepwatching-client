export interface ApiErrorResponse {
  message?: string;
  requestId?: string;
  status?: number;
  error?: {
    code: string;
    message: string;
  };
}
