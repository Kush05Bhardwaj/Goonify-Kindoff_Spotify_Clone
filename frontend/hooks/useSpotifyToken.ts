import { useState, useEffect } from 'react';
import { TokenStorage, API_ENDPOINTS, apiFetch } from '@/lib/api';

export function useSpotifyToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      // First, try to get token from localStorage (production)
      const storedToken = TokenStorage.getAccessToken();
      
      if (storedToken && !TokenStorage.isTokenExpired()) {
        setToken(storedToken);
        return;
      }

      // Fallback: Try to get token from backend via cookie (development)
      try {
        const data = await apiFetch(`${API_ENDPOINTS.auth.login.replace('/login', '/token')}`);
        if (data.token) {
          setToken(data.token);
        }
      } catch (error) {
        console.error('Failed to get token:', error);
      }
    };

    getToken();
  }, []);

  return token;
}
