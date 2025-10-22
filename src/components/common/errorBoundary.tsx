import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, Box, Button, Divider, Paper, Typography } from '@mui/material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  resetOnNavigation?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console (in production, send to error tracking service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to error tracking service (e.g., Sentry, LogRocket)
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    const { onReset } = this.props;

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (onReset) {
      onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorBoundaryFallback error={error} errorInfo={errorInfo} errorCount={errorCount} onReset={this.handleReset} />
      );
    }

    return children;
  }
}

interface ErrorBoundaryFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  onReset: () => void;
}

function ErrorBoundaryFallback({ error, errorInfo, errorCount, onReset }: ErrorBoundaryFallbackProps) {
  const navigate = useNavigate();

  const isDevelopment = process.env.NODE_ENV === 'development';
  const isRecurringError = errorCount > 2;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        mt: 4,
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: '800px',
          width: '100%',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'error.main',
          backgroundColor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <ErrorOutlineIcon
            color="error"
            sx={{
              fontSize: 64,
              mb: 1,
            }}
          />

          <Typography variant="h5" component="h2" color="error" align="center" gutterBottom>
            Something went wrong
          </Typography>

          <Alert severity="error" variant="outlined" sx={{ width: '100%' }}>
            {error?.message || 'An unexpected error occurred'}
          </Alert>

          {isRecurringError && (
            <Alert severity="warning" variant="outlined" sx={{ width: '100%' }}>
              This error has occurred multiple times. Please try returning to the home page or refreshing your browser.
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            We apologize for the inconvenience. You can try one of the options below to recover.
          </Typography>

          {/* Action buttons */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              mt: 2,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={onReset}
              disabled={isRecurringError}
            >
              Try Again
            </Button>

            <Button variant="outlined" color="primary" startIcon={<HomeIcon />} onClick={() => navigate('/home')}>
              Go to Home
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Reload Page
            </Button>
          </Box>

          {/* Development-only error details */}
          {isDevelopment && error && (
            <Box sx={{ width: '100%', mt: 3 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Error Details (Development Mode):
              </Typography>
              <Alert severity="info" variant="outlined" sx={{ width: '100%', mt: 1 }}>
                <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  <strong>Error:</strong> {error.toString()}
                </Typography>
                {error.stack && (
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', mt: 1 }}
                  >
                    <strong>Stack:</strong>
                    {'\n'}
                    {error.stack}
                  </Typography>
                )}
                {errorInfo?.componentStack && (
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', mt: 1 }}
                  >
                    <strong>Component Stack:</strong>
                    {'\n'}
                    {errorInfo.componentStack}
                  </Typography>
                )}
              </Alert>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const ComponentWithErrorBoundary = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;
