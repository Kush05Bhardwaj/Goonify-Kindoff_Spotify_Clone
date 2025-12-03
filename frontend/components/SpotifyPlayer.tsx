"use client";

import { useEffect, useState, useRef } from "react";

interface SpotifyPlayerProps {
  token: string;
  onDeviceReady?: (deviceId: string) => void;
}

interface SpotifyPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (data: any) => void) => void;
  removeListener: (event: string, callback?: (data: any) => void) => void;
  getCurrentState: () => Promise<any>;
  setName: (name: string) => Promise<void>;
  getVolume: () => Promise<number>;
  setVolume: (volume: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  previousTrack: () => Promise<void>;
  nextTrack: () => Promise<void>;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => SpotifyPlayer;
    };
  }
}

export default function SpotifyWebPlayer({ token, onDeviceReady }: SpotifyPlayerProps) {
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [deviceId, setDeviceId] = useState<string>("");
  const [isPaused, setIsPaused] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load Spotify Web Playback SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "Smart Music Explorer",
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      setPlayer(spotifyPlayer);

      spotifyPlayer.addListener("ready", ({ device_id }: any) => {
        console.log("✅ Spotify Web Player Ready with Device ID:", device_id);
        setDeviceId(device_id);
        setIsReady(true);
        
        // Automatically transfer playback to this device
        fetch('http://127.0.0.1:4000/api/playback/transfer', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_id })
        }).then(() => {
          console.log("✅ Playback transferred to Web Player");
        }).catch(err => {
          console.log("ℹ️ Could not auto-transfer playback:", err.message);
        });

        if (onDeviceReady) {
          onDeviceReady(device_id);
        }
      });

      spotifyPlayer.addListener("not_ready", ({ device_id }: any) => {
        console.log("Device ID has gone offline", device_id);
      });

      spotifyPlayer.addListener("player_state_changed", (state: any) => {
        if (!state) return;

        setCurrentTrack(state.track_window.current_track);
        setIsPaused(state.paused);
        setPosition(state.position);
        setDuration(state.duration);

        spotifyPlayer.getCurrentState().then((playerState) => {
          setIsActive(!!playerState);
        });
      });

      spotifyPlayer.connect();
    };

    return () => {
      player?.disconnect();
    };
  }, [token]);

  // Update position every second when playing
  useEffect(() => {
    if (!isPaused && isActive) {
      const interval = setInterval(() => {
        setPosition((prev) => Math.min(prev + 1000, duration));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, isActive, duration]);

  const handlePlayPause = () => {
    player?.togglePlay();
  };

  const handleNext = () => {
    player?.nextTrack();
  };

  const handlePrevious = () => {
    player?.previousTrack();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = parseInt(e.target.value);
    setPosition(newPosition);
    player?.seek(newPosition);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!isActive || !currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-3 sm:p-4">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-xs sm:text-sm">
          {isReady ? (
            <>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-emerald-400">🎵 Spotify Web Player Ready</p>
              </div>
              <p className="text-xs mt-1">
                Device: <span className="font-mono text-emerald-400">Smart Music Explorer</span>
              </p>
              <p className="text-xs mt-1">Click the play button on any track to start listening</p>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500 mx-auto mb-2"></div>
              <p>Initializing Spotify Player...</p>
              <p className="text-xs mt-1">This may take a few seconds</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 sm:p-4 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          {/* Album Art & Track Info */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full min-w-0">
            <img
              src={currentTrack.album.images[0]?.url}
              alt={currentTrack.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg shadow-lg flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-xs sm:text-sm truncate">{currentTrack.name}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                {currentTrack.artists.map((a: any) => a.name).join(", ")}
              </p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 flex-1 w-full">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handlePrevious}
                className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-full transition"
                title="Previous"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={handlePlayPause}
                className="p-2 sm:p-3 bg-emerald-500 hover:bg-emerald-400 rounded-full transition"
                title={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-full transition"
                title="Next"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 w-full">
              <span className="text-[10px] sm:text-xs text-slate-400 w-8 sm:w-10 text-right">
                {formatTime(position)}
              </span>
              <input
                type="range"
                min="0"
                max={duration}
                value={position}
                onChange={handleSeek}
                className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 sm:[&::-webkit-slider-thumb]:w-3 sm:[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
              />
              <span className="text-[10px] sm:text-xs text-slate-400 w-8 sm:w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Extra Controls */}
          <div className="hidden sm:flex items-center gap-2 flex-1 justify-end">
            <div className="text-[10px] sm:text-xs text-slate-500">
              <span className="hidden md:inline">Device: </span><span className="text-emerald-400">Web Player</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
