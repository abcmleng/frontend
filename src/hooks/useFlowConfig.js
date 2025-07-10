import { useState, useEffect } from 'react';
import KycApi from '../services/apiflowConfigService';

export function useFlowConfig(userId) {
  const [flowConfig, setFlowConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFlowConfig() {
      setLoading(true);
      setError(null);
      try {
        const response = await KycApi.fetchUserFlowConfig(userId);
        const data = response;
        if (data?.flow) {
          setFlowConfig(data.flow);
        } else {
          setFlowConfig([]);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadFlowConfig();
    }
  }, [userId]);

  return { flowConfig, loading, error };
}