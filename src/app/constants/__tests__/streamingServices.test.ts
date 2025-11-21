import { STREAMING_SERVICE_CONFIGS, getServiceConfig } from '../streamingServices';

describe('streamingServices', () => {
  describe('STREAMING_SERVICE_CONFIGS', () => {
    it('should contain Netflix configuration', () => {
      expect(STREAMING_SERVICE_CONFIGS.Netflix).toEqual({
        name: 'Netflix',
        color: '#E50914',
        logo: '/assets/images/streaming-services/netflix.svg',
      });
    });

    it('should contain Hulu configuration', () => {
      expect(STREAMING_SERVICE_CONFIGS.Hulu).toEqual({
        name: 'Hulu',
        color: '#1CE783',
        logo: '/assets/images/streaming-services/hulu.svg',
      });
    });

    it('should contain Amazon Prime Video configuration', () => {
      expect(STREAMING_SERVICE_CONFIGS['Amazon Prime Video']).toEqual({
        name: 'Amazon Prime Video',
        color: '#00A8E1',
        logo: '/assets/images/streaming-services/amazon-prime.svg',
      });
    });

    it('should contain Disney+ configuration', () => {
      expect(STREAMING_SERVICE_CONFIGS['Disney+']).toEqual({
        name: 'Disney+',
        color: '#113CCF',
        logo: '/assets/images/streaming-services/disney-plus.svg',
      });
    });

    it('should contain HBO Max configuration', () => {
      expect(STREAMING_SERVICE_CONFIGS['HBO Max']).toEqual({
        name: 'HBO Max',
        color: '#7C3EBB',
        logo: '/assets/images/streaming-services/hbo-max.svg',
      });
    });

    it('should have dark mode variants for Apple TV+', () => {
      const appleTV = STREAMING_SERVICE_CONFIGS['Apple TV+'];
      expect(appleTV.colorDark).toBe('#FFFFFF');
      expect(appleTV.logoDark).toBe('/assets/images/streaming-services/apple-tv.svg');
    });

    it('should have dark mode variants for Peacock', () => {
      const peacock = STREAMING_SERVICE_CONFIGS.Peacock;
      expect(peacock.colorDark).toBe('#FFFFFF');
      expect(peacock.logoDark).toBe('/assets/images/streaming-services/peacock.svg');
    });
  });

  describe('getServiceConfig', () => {
    it('should return config for known service', () => {
      const config = getServiceConfig('Netflix');
      expect(config.name).toBe('Netflix');
      expect(config.color).toBe('#E50914');
    });

    it('should normalize "Max" to "HBO Max"', () => {
      const config = getServiceConfig('Max');
      expect(config.name).toBe('HBO Max');
      expect(config.color).toBe('#7C3EBB');
    });

    it('should normalize "Amazon Prime" to "Amazon Prime Video"', () => {
      const config = getServiceConfig('Amazon Prime');
      expect(config.name).toBe('Amazon Prime Video');
      expect(config.color).toBe('#00A8E1');
    });

    it('should normalize "Disney" to "Disney+"', () => {
      const config = getServiceConfig('Disney');
      expect(config.name).toBe('Disney+');
      expect(config.color).toBe('#113CCF');
    });

    it('should normalize "Apple TV" to "Apple TV+"', () => {
      const config = getServiceConfig('Apple TV');
      expect(config.name).toBe('Apple TV+');
    });

    it('should normalize "Paramount" to "Paramount+"', () => {
      const config = getServiceConfig('Paramount');
      expect(config.name).toBe('Paramount+');
      expect(config.color).toBe('#0064FF');
    });

    it('should normalize case-insensitive "FOX" to "Fox"', () => {
      const config = getServiceConfig('FOX');
      expect(config.name).toBe('Fox');
      expect(config.color).toBe('#003DA5');
    });

    it('should return default config for unknown service', () => {
      const config = getServiceConfig('Unknown Service');
      expect(config.name).toBe('Unknown Service');
      expect(config.color).toBe('#757575');
      expect(config.logo).toBe('/assets/images/streaming-services/default.svg');
    });

    it('should handle empty string', () => {
      const config = getServiceConfig('');
      expect(config.name).toBe('');
      expect(config.color).toBe('#757575');
    });

    it('should return specific configs for all major services', () => {
      const services = [
        'Netflix',
        'Hulu',
        'Amazon Prime Video',
        'Disney+',
        'HBO Max',
        'Apple TV+',
        'Peacock',
        'Paramount+',
      ];

      services.forEach((service) => {
        const config = getServiceConfig(service);
        expect(config.name).toBe(service);
        expect(config.color).toBeTruthy();
        expect(config.logo).toBeTruthy();
      });
    });

    it('should return Theater config', () => {
      const config = getServiceConfig('Theater');
      expect(config.name).toBe('Theater');
      expect(config.color).toBe('#DAA520');
    });

    it('should return Unavailable config', () => {
      const config = getServiceConfig('Unavailable');
      expect(config.name).toBe('Unavailable');
      expect(config.color).toBe('#757575');
    });
  });
});
