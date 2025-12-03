# 🎵 Smart Music Explorer

**A next-generation AI-powered music discovery platform with a premium, futuristic UI**

A full-stack web application featuring **glassmorphism design**, **neon gradients**, and **cinematic animations** that integrates with Spotify, Last.fm, and Genius APIs to provide music insights, lyrics, and recommendations.

## ✨ Features

### 🎨 Premium UI/UX
- **Glassmorphism** elements with soft blur effects
- **Neon gradient backgrounds** (deep navy → teal → purple)
- **Glowing accents** and ambient lighting effects
- **Neumorphic cards** with 3D depth
- **Floating particles** and animated mesh backgrounds
- **Smooth micro-animations** and transitions
- **Premium fonts** (Inter/Poppins)
- **Apple-style minimal controls**

### 🎧 Core Features
- 🎵 **Web Playback**: Play music directly in your browser with premium player controls
- 🔥 **Top Tracks & Analytics**: View your listening habits with beautiful visualizations
- 🎼 **Song Lyrics**: Real-time lyrics from Genius
- 🎶 **AI-Powered Discovery**: Find similar tracks via Last.fm
- 📊 **Music Analytics**: Detailed insights with charts and graphs
- 🔍 **Smart Search**: Real-time search with debouncing
- 📁 **Playlist Management**: Browse and play your playlists
- 🔒 **Secure**: OAuth 2.0, HTTP-only cookies, CORS protection

## 🏗️ Architecture

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── config/          # Environment validation & config
│   ├── middleware/      # Auth, error handling, logging
│   ├── routes/          # API route handlers
│   │   ├── auth.js      # Spotify OAuth routes
│   │   ├── spotify.js   # Spotify API endpoints
│   │   └── music.js     # Last.fm & Genius endpoints
│   ├── services/        # External API integrations
│   │   ├── genius.js    # Genius lyrics service
│   │   └── lastfm.js    # Last.fm service
│   └── index.js         # Main server file
├── package.json
└── .env
```

### Frontend (Next.js 15 + TypeScript)
```
frontend/
├── app/
│   ├── page.tsx         # Landing page
│   └── app/
│       └── page.tsx     # Main app page
├── components/
│   ├── TrackCard.tsx    # Track display component
│   └── TrackDetails.tsx # Track details sidebar
├── lib/
│   └── api.ts           # API client & configuration
├── types/
│   └── index.ts         # TypeScript type definitions
└── .env.local
```

## 📡 API Endpoints

### Authentication
- `GET /api/auth/login` - Redirect to Spotify OAuth
- `GET /api/auth/callback` - OAuth callback handler
- `POST /api/auth/logout` - Clear auth cookies
- `GET /api/auth/status` - Check authentication status

### Spotify Endpoints
- `GET /api/me` - Get current user profile
- `GET /api/top-tracks?limit=10&time_range=medium_term` - Get top tracks
- `GET /api/top-artists?limit=10&time_range=medium_term` - Get top artists

### Music Discovery
- `GET /api/music/artist?name=ArtistName` - Get artist info from Last.fm
- `GET /api/music/similar-tracks?artist=X&track=Y` - Get similar tracks
- `GET /api/music/lyrics?artist=X&song=Y` - Get song lyrics

### Playback Control (NEW! 🎵)
- `GET /api/playback/current` - Get current playback state
- `PUT /api/playback/play` - Start/resume playback (body: `{uris: [], device_id: ""}`)
- `PUT /api/playback/pause` - Pause playback
- `POST /api/playback/next` - Skip to next track
- `POST /api/playback/previous` - Skip to previous track
- `PUT /api/playback/seek` - Seek to position (body: `{position: ms}`)
- `PUT /api/playback/volume` - Set volume (body: `{volume: 0-100}`)
- `GET /api/playback/devices` - Get available devices
- `PUT /api/playback/transfer` - Transfer playback to device (body: `{device_id: ""}`)
- `GET /api/auth/token` - Get access token for Web Playback SDK

### Utility
- `GET /api/health` - Health check endpoint
- `GET /` - API documentation

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Spotify Developer Account
- Last.fm API Key
- Genius API Token

### Environment Variables

**Backend** (`backend/.env`):
```env
PORT=4000

# Spotify OAuth
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:4000/api/auth/callback

# External APIs
LASTFM_API_KEY=your_lastfm_api_key
GENIUS_ACCESS_TOKEN=your_genius_token

# Frontend URL
FRONTEND_URL=http://127.0.0.1:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
```

### Installation Steps

1. **Clone the repository**
```bash
git clone <repo-url>
cd smart-music-explorer
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure environment variables**
- Copy `.env.example` files in both directories
- Fill in your API credentials

5. **Start the backend**
```bash
cd backend
npm run dev
```

6. **Start the frontend**
```bash
cd frontend
npm run dev
```

7. **Access the app**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## 🔧 Configuration

### Spotify App Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://127.0.0.1:4000/api/auth/callback`
4. **Important**: Add `http://127.0.0.1:3000` to "Web Playback SDK" allowed domains
5. Copy Client ID and Client Secret

**Note**: You need **Spotify Premium** to use the Web Playback SDK for in-browser playback

### Last.fm API Setup
1. Register at [Last.fm API](https://www.last.fm/api/account/create)
2. Create an API application
3. Copy the API key

### Genius API Setup
1. Go to [Genius API Clients](https://genius.com/api-clients)
2. Create a new API client
3. Generate an access token

## 🛡️ Security Features

- ✅ HTTP-only cookies for token storage
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation and sanitization
- ✅ Error handling middleware
- ✅ Environment variable validation
- ✅ Request timeouts
- ✅ HTTPS for external API calls

## 📦 Dependencies

### Backend
- `express` - Web framework
- `spotify-web-api-node` - Spotify API wrapper
- `genius-lyrics` - Genius lyrics fetcher
- `axios` - HTTP client for Last.fm
- `helmet` - Security headers
- `cors` - CORS middleware
- `cookie-parser` - Cookie parsing
- `dotenv` - Environment variables

### Frontend
- `next` - React framework
- `react` - UI library
- `typescript` - Type safety
- `framer-motion` - Animations
- `tailwindcss` - Styling

## 🎯 Improvements Implemented

### Backend
✅ Modular route structure (auth, spotify, music)  
✅ Centralized configuration management  
✅ Authentication middleware  
✅ Error handling middleware  
✅ Request logging  
✅ Environment validation on startup  
✅ Improved error messages  
✅ Input validation and sanitization  
✅ API timeout handling  
✅ Security headers with Helmet  
✅ Logout endpoint  
✅ Auth status endpoint  
✅ HTTPS for external APIs  

### Frontend
✅ TypeScript type definitions  
✅ Centralized API client  
✅ Environment variables for API URLs  
✅ Loading states  
✅ Error handling  
✅ URL encoding for API parameters  
✅ Proper prop types for components  
✅ Accessibility improvements  
✅ Fallback UI for missing data  

## 🎵 Using the Player

1. **Login** with your Spotify account (Premium required)
2. Navigate to the app page - you'll see "Spotify Player Ready" at the bottom
3. **Hover over any track** and click the green play button
4. Use the **player controls** at the bottom:
   - Play/Pause button
   - Previous/Next track buttons
   - Progress bar (drag to seek)
   - Current time and duration display
5. The player shows:
   - Album artwork
   - Track name and artist
   - Real-time progress

## 🎨 Design System

### Color Palette
- **Primary Cyan**: `#06fefe` - Main accent color
- **Teal**: `#14b8a6` - Secondary accent
- **Purple**: `#a855f7` - Tertiary accent
- **Navy Dark**: `#0a0e27` - Main background
- **Navy Medium**: `#1a1f3a` - Secondary background

### Typography
- **Display Font**: Poppins (headings, hero text)
- **Body Font**: Inter (paragraphs, UI text)
- **Weights**: 300-900 for maximum flexibility

### Effects
- **Glassmorphism**: `backdrop-blur(20px)` with rgba backgrounds
- **Neon Glow**: Multi-layer box-shadows with cyan/purple
- **Neumorphic**: Dual-direction shadows for 3D depth
- **Gradients**: Linear and radial gradients with smooth transitions
- **Animations**: Spring physics for natural motion

## 📝 Future Enhancements

### UI/UX
- [ ] Waveform visualizations for tracks
- [ ] Audio spectrum analyzer
- [ ] Custom theme builder
- [ ] Gesture controls for mobile
- [ ] Voice commands integration
- [ ] VR/AR music experience

### Features
- [ ] Token refresh mechanism
- [ ] Rate limiting
- [ ] Caching layer (Redis)
- [ ] Queue management
- [ ] Shuffle and repeat modes
- [ ] Device selection dropdown
- [ ] Social sharing features
- [ ] Collaborative playlists
- [ ] AI mood detection
- [ ] Smart recommendations ML model

### Technical
- [ ] Unit & integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] PWA support
- [ ] Offline mode

## 🐛 Known Issues

- Access tokens expire after 1 hour (refresh token implementation needed)
- Limited to 50 tracks/artists per request (Spotify API limitation)
- Lyrics might not be found for all songs

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ using Next.js, Express, and the Spotify API
