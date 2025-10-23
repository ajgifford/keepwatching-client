// Streaming service branding configuration
export interface StreamingServiceConfig {
  name: string;
  color: string;
  colorDark?: string; // Alternative color for dark mode
  logo: string;
  logoDark?: string; // Alternative logo for dark mode
}

// Service name mapping for variations/aliases
// Maps alternative service names to the canonical name used in STREAMING_SERVICE_CONFIGS
const SERVICE_NAME_MAPPING: Record<string, string> = {
  Max: 'HBO Max',
  'HBO Max': 'HBO Max',
  'Amazon Prime': 'Amazon Prime Video',
  Disney: 'Disney+',
  'Apple TV': 'Apple TV+',
  Paramount: 'Paramount+',
  'Paramount+ With Showtime': 'Paramount+',
  Fox: 'Fox',
  FOX: 'Fox',
};

// Import logo images
// Note: You'll need to create the assets/images/streaming-services directory
// and add your PNG files there with these exact names
export const STREAMING_SERVICE_CONFIGS: Record<string, StreamingServiceConfig> = {
  Netflix: {
    name: 'Netflix',
    color: '#E50914',
    logo: '/assets/images/streaming-services/netflix.svg',
  },
  Hulu: {
    name: 'Hulu',
    color: '#1CE783',
    logo: '/assets/images/streaming-services/hulu.svg',
  },
  'Amazon Prime Video': {
    name: 'Amazon Prime Video',
    color: '#00A8E1',
    logo: '/assets/images/streaming-services/amazon-prime.svg',
  },
  'Disney+': {
    name: 'Disney+',
    color: '#113CCF',
    logo: '/assets/images/streaming-services/disney-plus.svg',
  },
  'HBO Max': {
    name: 'HBO Max',
    color: '#7C3EBB',
    logo: '/assets/images/streaming-services/hbo-max.svg',
  },
  'Apple TV+': {
    name: 'Apple TV+',
    color: '#000000',
    colorDark: '#FFFFFF',
    logo: '/assets/images/streaming-services/apple-tv.svg',
    logoDark: '/assets/images/streaming-services/apple-tv.svg',
  },
  Peacock: {
    name: 'Peacock',
    color: '#000000',
    colorDark: '#FFFFFF',
    logo: '/assets/images/streaming-services/peacock.svg',
    logoDark: '/assets/images/streaming-services/peacock.svg',
  },
  'Paramount+': {
    name: 'Paramount+',
    color: '#0064FF',
    logo: '/assets/images/streaming-services/paramount-plus.svg',
  },
  ABC: {
    name: 'ABC',
    color: '#FFD500',
    logo: '/assets/images/streaming-services/abc.svg',
  },
  NBC: {
    name: 'NBC',
    color: '#FF6B35',
    logo: '/assets/images/streaming-services/nbc.svg',
  },
  CBS: {
    name: 'CBS',
    color: '#0072CE',
    logo: '/assets/images/streaming-services/cbs.svg',
  },
  Fox: {
    name: 'Fox',
    color: '#003DA5',
    colorDark: '#4A90E2',
    logo: '/assets/images/streaming-services/fox.svg',
  },
  TNT: {
    name: 'TNT',
    color: '#E52D27',
    logo: '/assets/images/streaming-services/tnt.svg',
  },
  TBS: {
    name: 'TBS',
    color: '#FF6B00',
    logo: '/assets/images/streaming-services/tbs.svg',
  },
  Starz: {
    name: 'Starz',
    color: '#000000',
    colorDark: '#FFFFFF',
    logo: '/assets/images/streaming-services/starz.svg',
    logoDark: '/assets/images/streaming-services/starz.svg',
  },
  Theater: {
    name: 'Theater',
    color: '#DAA520',
    logo: '/assets/images/streaming-services/theater.svg',
  },
  Unavailable: {
    name: 'Unavailable',
    color: '#757575',
    logo: '/assets/images/streaming-services/unavailable.svg',
  },
};

// Normalize service name using mapping
const normalizeServiceName = (serviceName: string): string => {
  return SERVICE_NAME_MAPPING[serviceName] || serviceName;
};

// Get service config with fallback for unknown services
export const getServiceConfig = (serviceName: string): StreamingServiceConfig => {
  const normalizedName = normalizeServiceName(serviceName);
  return (
    STREAMING_SERVICE_CONFIGS[normalizedName] || {
      name: serviceName, // Keep original name if no config found
      color: '#757575', // Default gray color
      logo: '/assets/images/streaming-services/default.svg',
    }
  );
};
