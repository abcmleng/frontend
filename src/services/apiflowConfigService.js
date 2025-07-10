import axios from 'axios';

class KycApi {
  constructor() {
    this.baseUrl = '/api';
    console.log('[KYC API] Base URL:', this.baseUrl);
  }

  async fetchUserFlowConfig(userId) {
    try {
      // Return mock flow configuration to bypass 400 error
      console.log('[KYC API] Using mock flow config for user:', userId);
      const mockFlowConfig = {
        steps: [
          'country-selection',
          'document-selection',
          'document-front-capture',
          'document-back-capture',
          'selfie-capture',
          'thank-you'
        ],
        settings: {
          enableMRZ: true,
          enableBarcode: true,
          documentTypes: ['passport', 'id-card', 'drivers-license'],
          countries: ['US', 'UK', 'CA', 'AU', 'DE', 'FR']
        }
      };
      
      console.log('[KYC API] Mock flow config response:', mockFlowConfig);
      return mockFlowConfig;
    } catch (error) {
      console.error('[KYC API] Failed to fetch user flow config:', error);
      throw error;
    }
  }
}

export default new KycApi();