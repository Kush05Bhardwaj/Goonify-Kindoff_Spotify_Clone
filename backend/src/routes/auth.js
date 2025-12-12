const express = require('express');
const { createSpotifyApi, FRONTEND_URL } = require('../config');
const { requireAuth } = require('../middleware');

const router = express.Router();

// Redirect user to Spotify authorization page
router.get('/login', (req, res) => {
  const scopes = [
    'user-read-email',
    'user-read-private',
    'user-top-read',
    'user-read-recently-played',      // Required for analytics
    'streaming',                      // Required for Web Playback SDK
    'user-read-playback-state',       // Read current playback
    'user-modify-playback-state',     // Control playback (play, pause, skip)
    'user-read-currently-playing',    // Read currently playing track
  ];

  const spotifyApi = createSpotifyApi();
  const state = Math.random().toString(36).substring(7);
  
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authorizeURL);
});

// Spotify redirects back here with ?code=
router.get('/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.redirect(`${FRONTEND_URL}?error=missing_code`);
  }

  const spotifyApi = createSpotifyApi();

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);

    const accessToken = data.body['access_token'];
    const refreshToken = data.body['refresh_token'];
    const expiresIn = data.body['expires_in'];

    // For production (different domains), pass tokens via URL
    // For development (same domain), use cookies
    const isDifferentDomain = !FRONTEND_URL.includes('localhost') && !FRONTEND_URL.includes('127.0.0.1');
    
    if (isDifferentDomain) {
      // Production: Pass tokens via URL parameters (frontend will store them)
      const params = new URLSearchParams({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn.toString()
      });
      res.redirect(`${FRONTEND_URL}/app?${params.toString()}`);
    } else {
      // Development: Use HTTP-only cookies
      res.cookie('spotify_access_token', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: expiresIn * 1000,
      });

      res.cookie('spotify_refresh_token', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.redirect(`${FRONTEND_URL}/app`);
    }
  } catch (err) {
    console.error('Error exchanging code for token:', err.message);
    return res.redirect(`${FRONTEND_URL}?error=auth_failed`);
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('spotify_access_token');
  res.clearCookie('spotify_refresh_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user's authentication status
router.get('/status', (req, res) => {
  const hasToken = !!req.cookies.spotify_access_token;
  res.json({ authenticated: hasToken });
});

module.exports = router;
