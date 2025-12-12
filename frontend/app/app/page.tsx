"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import { API_ENDPOINTS, apiFetch } from "@/lib/api";
import type { SpotifyUser, SpotifyTrack, TrackDetails as TrackDetailsType } from "@/types";
import { BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ViewMode = 'top-tracks' | 'recommendations' | 'playlist' | 'search' | 'analytics';

// Analytics Component
function AnalyticsView({ analytics, loading }: { analytics: any, loading: boolean }) {
  if (loading || !analytics) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="col-span-2 space-y-6"
      >
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-900/50 rounded-2xl p-6 h-64 animate-shimmer"></div>
        ))}
      </motion.div>
    );
  }

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const hourData = analytics.listeningByHour.map((count: number, hour: number) => ({
    hour: `${hour}:00`,
    plays: count
  }));

  const audioFeatureData = [
    { feature: 'Energy', value: Math.round(analytics.audioFeatures.energy) },
    { feature: 'Danceability', value: Math.round(analytics.audioFeatures.danceability) },
    { feature: 'Happiness', value: Math.round(analytics.audioFeatures.valence) },
    { feature: 'Acousticness', value: Math.round(analytics.audioFeatures.acousticness) },
    { feature: 'Speechiness', value: Math.round(analytics.audioFeatures.speechiness) }
  ];

  const COLORS = ['#10b981', '#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b', '#06b6d4', '#ef4444', '#6366f1', '#84cc16', '#f97316'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-2 space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl p-4 text-center"
        >
          <div className="text-2xl sm:text-3xl mb-1.5">⏱️</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-400">{formatTime(analytics.totalListeningTime)}</div>
          <div className="text-[10px] sm:text-xs md:text-sm text-slate-400">Total Listening Time</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 text-center"
        >
          <div className="text-2xl sm:text-3xl mb-1.5">🎵</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-400">{analytics.totalTracks}</div>
          <div className="text-[10px] sm:text-xs md:text-sm text-slate-400">Top Tracks</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4 text-center"
        >
          <div className="text-2xl sm:text-3xl mb-1.5">👤</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">{analytics.totalArtists}</div>
          <div className="text-[10px] sm:text-xs md:text-sm text-slate-400">Top Artists</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-xl p-4 text-center"
        >
          <div className="text-2xl sm:text-3xl mb-1.5">⭐</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-pink-400">{analytics.avgPopularity}</div>
          <div className="text-[10px] sm:text-xs md:text-sm text-slate-400">Avg Popularity</div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Listening by Hour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-slate-100 mb-4">📅 Listening Pattern by Hour</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 12 }} interval={2} />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="plays" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Genres */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-slate-100 mb-4">🎭 Top Genres</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.topGenres}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ genre, percent }: any) => `${genre.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.topGenres.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Audio Features Radar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-slate-100 mb-4">🎶 Audio Features Profile</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={audioFeatureData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="feature" stroke="#94a3b8" />
            <PolarRadiusAxis stroke="#94a3b8" angle={90} domain={[0, 100]} />
            <Radar name="Your Music" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-4 mt-4 text-center text-xs">
          <div>
            <div className="text-slate-400">Energy</div>
            <div className="text-emerald-400 font-semibold">{Math.round(analytics.audioFeatures.energy)}%</div>
          </div>
          <div>
            <div className="text-slate-400">Danceability</div>
            <div className="text-purple-400 font-semibold">{Math.round(analytics.audioFeatures.danceability)}%</div>
          </div>
          <div>
            <div className="text-slate-400">Happiness</div>
            <div className="text-blue-400 font-semibold">{Math.round(analytics.audioFeatures.valence)}%</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AppPage() {
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SpotifyTrack | null>(null);
  const [similarTracks, setSimilarTracks] = useState<any[]>([]);
  const [lyrics, setLyrics] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playingTrackUri, setPlayingTrackUri] = useState<string | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [recommendations, setRecommendations] = useState<SpotifyTrack[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('top-tracks');
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Extract tokens from URL (production auth flow)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const expiresIn = params.get('expires_in');

      if (accessToken && refreshToken && expiresIn) {
        // Store tokens
        const { TokenStorage } = require('@/lib/api');
        TokenStorage.setTokens(accessToken, refreshToken, parseInt(expiresIn));
        
        // Clean URL
        window.history.replaceState({}, document.title, '/app');
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const { TokenStorage } = require('@/lib/api');
      TokenStorage.clearTokens();
      
      await fetch(`${API_ENDPOINTS.auth.logout}`, {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Failed to logout');
    }
  };

  const loadTrackDetails = async (track: SpotifyTrack) => {
    const artist = track.artists[0]?.name;
    const song = track.name;

    try {
      const [similar, lyricsData] = await Promise.all([
        apiFetch(`${API_ENDPOINTS.music.similarTracks}?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(song)}`),
        apiFetch(`${API_ENDPOINTS.music.lyrics}?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}`)
      ]);

      setSimilarTracks(similar);
      setLyrics(lyricsData.lyrics);
    } catch (err: any) {
      console.error('Error loading track details:', err);
    }
  };

  const selectTrack = (track: SpotifyTrack) => {
    setSelected(track);
    setShowLyrics(false);
    loadTrackDetails(track);
  };

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const data = await apiFetch(API_ENDPOINTS.spotify.analytics);
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics failed:', err);
      setError('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await apiFetch(`${API_ENDPOINTS.spotify.search}?q=${encodeURIComponent(query)}`);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const loadPlaylist = async (playlistId: string) => {
    try {
      const playlistTracks = await apiFetch(`${API_ENDPOINTS.spotify.playlist}/${playlistId}`);
      setTracks(playlistTracks.filter((t: any) => t !== null));
    } catch (err) {
      console.error('Failed to load playlist:', err);
      setError('Failed to load playlist');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get token first (from localStorage or cookie)
        const { TokenStorage } = require('@/lib/api');
        const storedToken = TokenStorage.getAccessToken();
        
        // Fetch token from backend if not in localStorage (development mode)
        let tokenValue = storedToken;
        if (!tokenValue || TokenStorage.isTokenExpired()) {
          try {
            const tokenData = await apiFetch(API_ENDPOINTS.auth.token);
            tokenValue = tokenData.token;
          } catch (err) {
            console.log('No cookie token available');
          }
        }
        
        if (tokenValue) {
          setToken(tokenValue);
        }

        // Load all data in parallel
        const [userData, tracksData, recsData, playlistsData] = await Promise.all([
          apiFetch(API_ENDPOINTS.spotify.me),
          apiFetch(`${API_ENDPOINTS.spotify.topTracks}?time_range=${timeRange}`),
          apiFetch(API_ENDPOINTS.spotify.recommendations),
          apiFetch(API_ENDPOINTS.spotify.playlists)
        ]);

        setUser(userData);
        setTracks(tracksData);
        setRecommendations(recsData);
        setPlaylists(playlistsData);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery && viewMode === 'search') {
        handleSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, viewMode, handleSearch]);

  useEffect(() => {
    if (viewMode === 'analytics' && !analytics) {
      loadAnalytics();
    }
  }, [viewMode, analytics, loadAnalytics]);

  const handleDeviceReady = (id: string) => {
    setDeviceId(id);
  };

  const playTrack = async (trackUri: string) => {
    try {
      setError("");
      setPlayingTrackUri(trackUri);

      const body: any = { uris: [trackUri] };
      if (deviceId) body.device_id = deviceId;

      const { TokenStorage } = require('@/lib/api');
      const accessToken = TokenStorage.getAccessToken();

      const response = await fetch(API_ENDPOINTS.playback.play, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to start playback');
      }

      // Clear loading state after successful playback
      setTimeout(() => setPlayingTrackUri(null), 1000);
    } catch (err: any) {
      setPlayingTrackUri(null);
      const errorMsg = err.message.toLowerCase();
      if (errorMsg.includes('no_active_device') || errorMsg.includes('device')) {
        setError("⏳ Player initializing... wait a moment");
      } else if (errorMsg.includes('premium')) {
        setError("🎵 Spotify Premium required");
      } else {
        setError(`❌ ${err.message}`);
      }
      setTimeout(() => setError(""), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 relative z-10"
        >
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-emerald-400/30 border-b-transparent animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <div className="space-y-2">
            <p className="text-slate-200 text-xl font-medium">Loading your music...</p>
            <p className="text-slate-500 text-sm">Connecting to Spotify</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 pb-40">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/50 shadow-lg shadow-black/10">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-lg shadow-emerald-500/30"
              >
                🎵
              </motion.div>
              <div>
                <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Smart Music Explorer
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">
                  Welcome back, <span className="text-emerald-400">{user?.display_name}</span>
                </p>
              </div>
            </div>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={user.images?.[0]?.url}
                    alt="Profile"
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20 hover:border-emerald-400 transition-colors"
                  />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-72 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                    >
                      <div className="p-5 border-b border-slate-700/50 bg-gradient-to-r from-emerald-500/10 to-transparent">
                        <p className="font-bold text-lg text-slate-100">{user.display_name}</p>
                        <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
                        <div className="mt-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                            user.product === 'premium' 
                              ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                          }`}>
                            {user.product === 'premium' ? '✨ Premium' : '🎵 Free'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-5 py-4 text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-8">
          {/* Left: Tracks List */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide"
            >
              {[
                { mode: 'top-tracks', icon: '🎵', label: 'Top Tracks', shortLabel: 'Top', color: 'emerald' },
                { mode: 'recommendations', icon: '✨', label: 'Trending', shortLabel: 'Recs', color: 'purple' },
                { mode: 'playlist', icon: '📁', label: 'Playlists', shortLabel: 'Lists', color: 'blue' },
                { mode: 'search', icon: '🔍', label: 'Search', shortLabel: 'Search', color: 'pink' },
                { mode: 'analytics', icon: '📊', label: 'Analytics', shortLabel: 'Stats', color: 'cyan' }
              ].map(({ mode, icon, label, shortLabel, color }) => (
                <motion.button
                  key={mode}
                  onClick={() => setViewMode(mode as ViewMode)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    viewMode === mode
                      ? `bg-gradient-to-r from-${color}-500 to-${color}-600 text-white shadow-lg shadow-${color}-500/30 border border-${color}-400/30`
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600/50'
                  }`}
                >
                  <span className="hidden sm:inline">{icon} {label}</span>
                  <span className="sm:hidden">{icon} {shortLabel}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Search Bar */}
            {viewMode === 'search' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for songs, artists, albums..."
                    className="w-full px-5 py-4 pl-14 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 
                      focus:outline-none focus:border-pink-500/50 focus:bg-slate-800/80
                      transition-all duration-300 text-sm sm:text-base"
                  />
                  <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searching && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Playlist Selector */}
            {viewMode === 'playlist' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              >
                {playlists.map((playlist, idx) => (
                  <motion.button
                    key={playlist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      setSelectedPlaylist(playlist);
                      loadPlaylist(playlist.id);
                    }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className={`group p-3 rounded-xl text-left transition-all ${
                      selectedPlaylist?.id === playlist.id
                        ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20'
                        : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-3 shadow-lg">
                      <img 
                        src={playlist.images?.[0]?.url || '/placeholder.png'} 
                        alt={playlist.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    </div>
                    <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-blue-300 transition-colors">{playlist.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{playlist.tracks.total} tracks</p>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Time Range Selector (only for top tracks) */}
            {viewMode === 'top-tracks' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30"
              >
                <span className="text-sm text-slate-400 font-medium">📅 Time Range:</span>
                <div className="flex gap-2">
                  {[
                    { value: 'short_term', label: 'Last Month', icon: '📆' },
                    { value: 'medium_term', label: 'Last 6 Months', icon: '📊' },
                    { value: 'long_term', label: 'All Time', icon: '🏆' }
                  ].map((range) => (
                    <motion.button
                      key={range.value}
                      onClick={() => setTimeRange(range.value as any)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        timeRange === range.value
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                      }`}
                    >
                      <span className="hidden sm:inline">{range.icon} </span>{range.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tracks Grid / Analytics View */}
            <AnimatePresence mode="wait">
              {viewMode === 'analytics' ? (
                <AnalyticsView analytics={analytics} loading={loadingAnalytics} />
              ) : viewMode === 'search' && searchQuery && searchResults.length === 0 && !searching ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-2 text-center py-24"
                >
                  <div className="text-7xl mb-6">🔍</div>
                  <p className="text-xl text-slate-300 font-medium mb-2">No results found</p>
                  <p className="text-slate-500">Try searching for &quot;{searchQuery}&quot; with different keywords</p>
                </motion.div>
              ) : viewMode === 'search' && !searchQuery ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-2 text-center py-24"
                >
                  <div className="text-7xl mb-6 animate-float">🎵</div>
                  <p className="text-xl text-slate-300 font-medium mb-2">Search for music</p>
                  <p className="text-slate-500">Start typing to find songs, artists, and albums</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(viewMode === 'search' ? searchResults : viewMode === 'recommendations' ? recommendations : tracks).map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  whileHover={{ scale: 1.02, y: -3 }}
                  className={`group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                    selected?.id === track.id
                      ? 'border-emerald-500/60 shadow-xl shadow-emerald-500/20 ring-1 ring-emerald-500/30'
                      : 'border-slate-700/50 hover:border-slate-600/60 hover:shadow-lg hover:shadow-black/20'
                  }`}
                  onClick={() => selectTrack(track)}
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative p-4">
                    <div className="flex gap-4">
                      {/* Album Art */}
                      <div className="relative flex-shrink-0">
                        <motion.img
                          src={track.album.images?.[1]?.url || track.album.images?.[0]?.url}
                          alt={track.name}
                          className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl shadow-lg object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        />
                        <motion.button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            playTrack(track.uri);
                          }}
                          disabled={playingTrackUri === track.uri}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center"
                        >
                          {playingTrackUri === track.uri ? (
                            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40">
                              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          )}
                        </motion.button>
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0 py-1">
                        <h3 className="font-bold text-sm sm:text-base text-slate-100 truncate mb-1.5 group-hover:text-emerald-300 transition-colors">
                          {track.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 truncate mb-2">
                          {track.artists.map(a => a.name).join(', ')}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] sm:text-xs text-slate-500 px-2 py-1 bg-slate-800/80 rounded-md truncate max-w-[180px] border border-slate-700/30">
                            💿 {track.album.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Track Details Sidebar */}
          <div className="lg:sticky lg:top-28 h-fit">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  className="bg-gradient-to-br from-slate-800/70 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/30"
                >
                  {/* Album Art Header */}
                  <div className="relative h-72 group">
                    <img
                      src={selected.album.images?.[0]?.url}
                      alt={selected.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                    <motion.button
                      onClick={() => setSelected(null)}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute top-4 right-4 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center transition-colors border border-white/10"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                    
                    {/* Track info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{selected.name}</h2>
                      <p className="text-slate-300 text-sm">{selected.artists.map(a => a.name).join(', ')}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Album Info */}
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                      <span className="text-2xl">💿</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Album</p>
                        <p className="text-sm text-slate-200 truncate">{selected.album.name}</p>
                      </div>
                    </div>

                    {/* Play Button */}
                    <motion.button
                      onClick={() => playTrack(selected.uri)}
                      disabled={playingTrackUri === selected.uri}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40"
                    >
                      {playingTrackUri === selected.uri ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                          Play Now
                        </>
                      )}
                    </motion.button>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-slate-700/50 relative">
                      <motion.button
                        onClick={() => setShowLyrics(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-4 py-3 text-sm font-semibold transition-colors relative ${
                          !showLyrics
                            ? 'text-emerald-400'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        🎵 Similar Tracks
                        {!showLyrics && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-500"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={() => setShowLyrics(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-4 py-3 text-sm font-semibold transition-colors relative ${
                          showLyrics
                            ? 'text-purple-400'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        📝 Lyrics
                        {showLyrics && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-purple-500"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    </div>

                    {/* Content */}
                    <div className="max-h-96 overflow-y-auto scrollbar-hide">
                      <AnimatePresence mode="wait">
                        {!showLyrics ? (
                          <motion.div
                            key="similar"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-3"
                          >
                            {similarTracks.length > 0 ? (
                              similarTracks.map((track: any, i: number) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  whileHover={{ scale: 1.02, x: 4 }}
                                  className="group p-3.5 bg-slate-800/40 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer border border-slate-700/30 hover:border-emerald-500/30"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
                                      🎵
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-emerald-300 transition-colors">{track.name}</p>
                                      <p className="text-xs text-slate-500 truncate">{track.artist?.name}</p>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </motion.div>
                              ))
                            ) : (
                              <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                  <div key={i} className="p-4 bg-slate-800/30 rounded-xl animate-shimmer border border-slate-700/20">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-slate-700/50 rounded-lg"></div>
                                      <div className="flex-1">
                                        <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-slate-700/30 rounded w-1/2"></div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="lyrics"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="relative"
                          >
                            {lyrics ? (
                              <div className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/30">
                                <pre className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap font-sans">
                                  {lyrics}
                                </pre>
                              </div>
                            ) : (
                              <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/20 space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <div key={i} className="h-4 bg-slate-700/30 rounded animate-shimmer" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center"
                >
                  <div className="text-7xl mb-5 animate-float">🎵</div>
                  <p className="text-lg text-slate-300 font-medium mb-2">No track selected</p>
                  <p className="text-sm text-slate-500">Click on any track to view details, lyrics, and similar songs</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed top-24 right-6 bg-gradient-to-r from-red-900/95 to-red-800/95 backdrop-blur-xl border border-red-600/50 text-white px-5 py-4 rounded-xl shadow-2xl shadow-red-900/30 max-w-md z-50"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                ⚠️
              </div>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotify Web Player */}
      {token && <SpotifyPlayer token={token} onDeviceReady={handleDeviceReady} />}
    </div>
  );
}
