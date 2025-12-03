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

  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:4000/api/auth/logout', {
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
    Promise.all([
      apiFetch(API_ENDPOINTS.spotify.me),
      apiFetch(`${API_ENDPOINTS.spotify.topTracks}?time_range=${timeRange}`),
      apiFetch('http://127.0.0.1:4000/api/auth/token'),
      apiFetch(API_ENDPOINTS.spotify.recommendations),
      apiFetch(API_ENDPOINTS.spotify.playlists)
    ])
      .then(([userData, tracksData, tokenData, recsData, playlistsData]) => {
        setUser(userData);
        setTracks(tracksData);
        setToken(tokenData.token);
        setRecommendations(recsData);
        setPlaylists(playlistsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load data");
        setLoading(false);
      });
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

      const response = await fetch('http://127.0.0.1:4000/api/playback/play', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-300 text-lg">Loading your music...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-lg sm:text-xl">
                🎵
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-slate-100">Smart Music Explorer</h1>
                <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Welcome back, {user?.display_name}</p>
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
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-500/50"
                  />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-800">
                        <p className="font-semibold text-slate-100">{user.display_name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                        <div className="mt-2 text-xs">
                          <span className={`inline-block px-2 py-1 rounded ${
                            user.product === 'premium' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-slate-700 text-slate-400'
                          }`}>
                            {user.product === 'premium' ? '✨ Premium' : 'Free'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-900/20 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
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
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left: Tracks List */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide"
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
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    viewMode === mode
                      ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/30`
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
                className="relative"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for songs, artists, albums..."
                  className="w-full px-4 py-3 pl-12 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Playlist Selector */}
            {viewMode === 'playlist' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              >
                {playlists.map((playlist) => (
                  <motion.button
                    key={playlist.id}
                    onClick={() => {
                      setSelectedPlaylist(playlist);
                      loadPlaylist(playlist.id);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl text-left transition-all ${
                      selectedPlaylist?.id === playlist.id
                        ? 'bg-blue-500/20 border-2 border-blue-500'
                        : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-2">
                      <img src={playlist.images?.[0]?.url || '/placeholder.png'} alt={playlist.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-medium text-slate-100 truncate">{playlist.name}</p>
                    <p className="text-xs text-slate-500">{playlist.tracks.total} tracks</p>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Time Range Selector (only for top tracks) */}
            {viewMode === 'top-tracks' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 overflow-x-auto pb-2"
              >
                <span className="text-sm text-slate-400 whitespace-nowrap">Time Range:</span>
                {[
                  { value: 'short_term', label: 'Last Month' },
                  { value: 'medium_term', label: 'Last 6 Months' },
                  { value: 'long_term', label: 'All Time' }
                ].map((range) => (
                  <motion.button
                    key={range.value}
                    onClick={() => setTimeRange(range.value as any)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      timeRange === range.value
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {range.label}
                  </motion.button>
                ))}
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
                  className="col-span-2 text-center py-20"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-slate-400">No results found for "{searchQuery}"</p>
                </motion.div>
              ) : viewMode === 'search' && !searchQuery ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-2 text-center py-20"
                >
                  <div className="text-6xl mb-4">🎵</div>
                  <p className="text-slate-400">Start typing to search for songs</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(viewMode === 'search' ? searchResults : viewMode === 'recommendations' ? recommendations : tracks).map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className={`group relative bg-slate-900/50 backdrop-blur-sm rounded-xl border transition-all duration-300 cursor-pointer ${
                    selected?.id === track.id
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                  onClick={() => selectTrack(track)}
                >
                  <div className="p-3">
                    <div className="flex gap-3">
                      {/* Album Art */}
                      <div className="relative flex-shrink-0">
                        <motion.img
                          src={track.album.images?.[1]?.url || track.album.images?.[0]?.url}
                          alt={track.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg"
                          whileHover={{ scale: 1.1 }}
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
                          className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          {playingTrackUri === track.uri ? (
                            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <motion.svg 
                              className="w-8 h-8 text-white" 
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                              whileHover={{ scale: 1.2 }}
                            >
                              <path d="M8 5v14l11-7z" />
                            </motion.svg>
                          )}
                        </motion.button>
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-slate-100 truncate mb-1">
                          {track.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 truncate mb-1.5">
                          {track.artists.map(a => a.name).join(', ')}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
                          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-slate-800 rounded truncate max-w-[150px]">
                            {track.album.name}
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
          <div className="lg:sticky lg:top-24 h-fit">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden"
                >
                  {/* Album Art Header */}
                  <div className="relative h-64">
                    <img
                      src={selected.album.images?.[0]?.url}
                      alt={selected.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    <button
                      onClick={() => setSelected(null)}
                      className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Track Info */}
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100 mb-2">{selected.name}</h2>
                      <p className="text-slate-400">{selected.artists.map(a => a.name).join(', ')}</p>
                      <p className="text-sm text-slate-500 mt-1">{selected.album.name}</p>
                    </div>

                    {/* Play Button */}
                    <motion.button
                      onClick={() => playTrack(selected.uri)}
                      disabled={playingTrackUri === selected.uri}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
                    >
                      {playingTrackUri === selected.uri ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <motion.svg 
                            className="w-5 h-5" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <path d="M8 5v14l11-7z" />
                          </motion.svg>
                          Play Now
                        </>
                      )}
                    </motion.button>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-slate-800 relative">
                      <motion.button
                        onClick={() => setShowLyrics(false)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                          !showLyrics
                            ? 'text-emerald-400'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        Similar Tracks
                        {!showLyrics && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={() => setShowLyrics(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                          showLyrics
                            ? 'text-emerald-400'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        Lyrics
                        {showLyrics && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    </div>

                    {/* Content */}
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                      <AnimatePresence mode="wait">
                        {!showLyrics ? (
                          <motion.div
                            key="similar"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-2"
                          >
                            {similarTracks.length > 0 ? (
                              similarTracks.map((track: any, i: number) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  whileHover={{ scale: 1.02, x: 4 }}
                                  className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                  <p className="text-sm font-medium text-slate-200">{track.name}</p>
                                  <p className="text-xs text-slate-500">{track.artist?.name}</p>
                                </motion.div>
                              ))
                            ) : (
                              <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                  <div key={i} className="p-3 bg-slate-800/30 rounded-lg animate-shimmer">
                                    <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-slate-700/30 rounded w-1/2"></div>
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
                            className="prose prose-invert prose-sm max-w-none"
                          >
                            {lyrics ? (
                              <pre className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-sans">
                                {lyrics}
                              </pre>
                            ) : (
                              <div className="space-y-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <div key={i} className="h-3 bg-slate-700/30 rounded animate-shimmer" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-12 text-center"
                >
                  <div className="text-6xl mb-4">🎵</div>
                  <p className="text-slate-400">Select a track to see details</p>
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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed top-20 right-6 bg-red-900/90 backdrop-blur-sm border border-red-700 text-white px-4 py-3 rounded-xl shadow-2xl max-w-md z-50"
          >
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotify Web Player */}
      {token && <SpotifyPlayer token={token} onDeviceReady={handleDeviceReady} />}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(30 41 59 / 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(100 116 139);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(148 163 184);
        }
      `}</style>
    </div>
  );
}
