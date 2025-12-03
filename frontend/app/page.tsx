"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_ENDPOINTS, apiFetch } from "@/lib/api";
import type { HealthResponse } from "@/types";

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(API_ENDPOINTS.health)
      .then(data => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Cannot reach backend");
        setLoading(false);
      });
  }, []);

  const handleSpotifyLogin = () => {
    window.location.href = API_ENDPOINTS.auth.login;
  };

  const features = [
    {
      icon: "🎵",
      title: "Web Playback",
      description: "Play music directly in your browser with full controls"
    },
    {
      icon: "🔥",
      title: "Top Tracks",
      description: "Discover your most listened to songs and artists"
    },
    {
      icon: "🎼",
      title: "Lyrics",
      description: "Read along with synchronized lyrics from Genius"
    },
    {
      icon: "🎶",
      title: "Similar Music",
      description: "Find new songs based on your favorites"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl">
                🎵
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
                Smart Music Explorer
              </span>
            </div>
            {health && (
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-slate-400">Live</span>
              </div>
            )}
          </motion.div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Your Music,
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                Reimagined
              </span>
            </motion.h1>

            <motion.p 
              className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Discover insights about your listening habits, play music in your browser,
              and explore new tracks with AI-powered recommendations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
            >
              <button
                onClick={handleSpotifyLogin}
                className="group relative w-full sm:w-auto min-w-[200px] px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/50"
              >
                <span className="flex items-center justify-center gap-2.5">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Connect with Spotify
                </span>
              </button>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/30"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>

            {health && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-slate-500"
              >
                ✨ Requires Spotify Premium for playback features
              </motion.p>
            )}
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 px-4">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Explore Music
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="group bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  <div className="text-4xl sm:text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-lg rounded-2xl border border-slate-700 p-5 sm:p-8 text-center"
          >
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              <div>
                <div className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1.5">
                  100%
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-slate-400">Free & Open Source</div>
              </div>
              <div>
                <div className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1.5">
                  10+
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-slate-400">Features</div>
              </div>
              <div>
                <div className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1.5">
                  ∞
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-slate-400">Songs to Explore</div>
              </div>
            </div>

            <motion.button
              onClick={handleSpotifyLogin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-5 sm:mt-6 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl font-semibold transition-all duration-300 shadow-lg text-sm"
            >
              Get Started Now →
            </motion.button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-slate-800">
          <div className="text-center text-slate-500 text-sm">
            <p>Built with ❤️ using Next.js, Express, and Spotify API</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
