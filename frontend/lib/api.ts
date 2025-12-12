// API Configuration
// Remove trailing slash to prevent double slashes in URLs
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

// API Endpoints
export const API_ENDPOINTS = {
  health: `${API_URL}/api/health`,
  auth: {
    login: `${API_URL}/api/auth/login`,
    logout: `${API_URL}/api/auth/logout`,
    status: `${API_URL}/api/auth/status`,
  },
  spotify: {
    me: `${API_URL}/api/me`,
    topTracks: `${API_URL}/api/top-tracks`,
    topArtists: `${API_URL}/api/top-artists`,
    recommendations: `${API_URL}/api/recommendations`,
    playlists: `${API_URL}/api/playlists`,
    playlist: `${API_URL}/api/playlist`,
    search: `${API_URL}/api/search`,
    recentlyPlayed: `${API_URL}/api/recently-played`,
    analytics: `${API_URL}/api/analytics`,
  },
  music: {
    artist: `${API_URL}/api/music/artist`,
    similarTracks: `${API_URL}/api/music/similar-tracks`,
    lyrics: `${API_URL}/api/music/lyrics`,
  },
  playback: {
    current: `${API_URL}/api/playback/current`,
    play: `${API_URL}/api/playback/play`,
    pause: `${API_URL}/api/playback/pause`,
    next: `${API_URL}/api/playback/next`,
    previous: `${API_URL}/api/playback/previous`,
    seek: `${API_URL}/api/playback/seek`,
    volume: `${API_URL}/api/playback/volume`,
    devices: `${API_URL}/api/playback/devices`,
    transfer: `${API_URL}/api/playback/transfer`,
  }
};

// Token storage helpers
export const TokenStorage = {
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_access_token', accessToken);
      localStorage.setItem('spotify_refresh_token', refreshToken);
      localStorage.setItem('spotify_token_expires', (Date.now() + expiresIn * 1000).toString());
    }
  },
  
  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('spotify_access_token');
    }
    return null;
  },
  
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('spotify_token_expires');
    }
  },
  
  isTokenExpired: (): boolean => {
    if (typeof window !== 'undefined') {
      const expires = localStorage.getItem('spotify_token_expires');
      if (!expires) return true;
      return Date.now() >= parseInt(expires);
    }
    return true;
  }
};

// Fetch helper with credentials and authorization
export async function apiFetch(url: string, options: RequestInit = {}) {
  const accessToken = TokenStorage.getAccessToken();
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Still include cookies for development
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
