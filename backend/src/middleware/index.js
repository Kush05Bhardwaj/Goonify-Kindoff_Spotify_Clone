// Authentication middleware
function requireAuth(req, res, next) {
  // Try to get token from Authorization header first (for production)
  let accessToken = null;
  
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    accessToken = authHeader.substring(7);
  }
  
  // Fallback to cookies (for development)
  if (!accessToken) {
    accessToken = req.cookies.spotify_access_token;
  }
  
  if (!accessToken) {
    return res.status(401).json({ error: "Not authenticated. Please login with Spotify." });
  }
  
  req.accessToken = accessToken;
  next();
}

// Error handler middleware
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
}

// Request logger middleware
function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
}

module.exports = { requireAuth, errorHandler, requestLogger };
