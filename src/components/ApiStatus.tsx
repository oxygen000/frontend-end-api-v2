import React, { useEffect, useState } from 'react';
import { registrationApi } from '../services/api';
import { BASE_API_URL } from '../config/constants';

interface HealthResponse {
  status: string;
  version: string;
}

const ApiStatus: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState<boolean>(false);
  const [apiVersion, setApiVersion] = useState<string>('Unknown');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // First try our API health check from the service
        const isHealthy = await registrationApi.checkApiHealth();
        setIsHealthy(isHealthy);

        // Additionally try to get the version info
        try {
          const response = await fetch(`${BASE_API_URL}/api/health`);
          const data: HealthResponse = await response.json();
          setApiVersion(data.version || 'Unknown');
        } catch (error) {
          console.error('Version check failed:', error);
        }

        setLastChecked(new Date());
      } catch (error) {
        console.error('Health check failed:', error);
        setIsHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-3 h-3 rounded-full ${
          isHealthy ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-sm text-gray-600">
        API {isHealthy ? 'Online' : 'Offline'} (v{apiVersion})
      </span>
      <span className="text-xs text-gray-500">
        Last checked: {lastChecked.toLocaleTimeString()}
      </span>
    </div>
  );
};

export default ApiStatus;
