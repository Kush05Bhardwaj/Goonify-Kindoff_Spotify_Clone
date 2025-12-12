# 🚀 Deployment Guide

Complete guide for deploying Smart Music Explorer to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] **Spotify Developer Account** with app created
- [ ] **Last.fm API Key** 
- [ ] **Genius API Access Token**
- [ ] **Spotify Premium Account** (required for Web Playback)
- [ ] Production URLs decided (e.g., `app.yourdomain.com`, `api.yourdomain.com`)
- [ ] SSL certificates ready (or using platform's SSL)
- [ ] All API keys and secrets ready
- [ ] Git repository set up

---

## 🌐 Deployment Options

### Option 1: Vercel + Render (Recommended)

**Best for:** Quick deployment, free tier available, minimal configuration

**Cost:** Free tier available, $7/month for Render hobby tier

#### Step 1: Deploy Backend to Render

1. **Sign up** at [render.com](https://render.com)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     ```
     Name: smart-music-explorer-api
     Environment: Node
     Region: Choose closest to your users
     Branch: main
     Root Directory: backend
     Build Command: npm install
     Start Command: npm start
     ```

3. **Set Environment Variables**
   
   Go to "Environment" tab and add:
   ```env
   PORT=4000
   NODE_ENV=production
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REDIRECT_URI=https://your-app.onrender.com/api/auth/callback
   LASTFM_API_KEY=your_lastfm_key
   GENIUS_ACCESS_TOKEN=your_genius_token
   FRONTEND_URL=https://your-app.vercel.app
   ```

4. **Deploy!**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL (e.g., `https://smart-music-explorer-api.onrender.com`)

5. **Update Spotify App Settings**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Edit your app
   - Add Redirect URI: `https://your-app.onrender.com/api/auth/callback`
   - Save settings

#### Step 2: Deploy Frontend to Vercel

1. **Sign up** at [vercel.com](https://vercel.com)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import from Git (GitHub/GitLab/Bitbucket)
   - Select your repository

3. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build (auto-detected)
   Output Directory: .next (auto-detected)
   Install Command: npm install (auto-detected)
   ```

4. **Add Environment Variable**
   - Go to "Settings" → "Environment Variables"
   - Add:
     ```
     Name: NEXT_PUBLIC_API_URL
     Value: https://your-app.onrender.com
     ```

5. **Deploy!**
   - Click "Deploy"
   - Wait for build (2-5 minutes)
   - Copy your frontend URL

6. **Update Backend CORS**
   - Go back to Render dashboard
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Redeploy backend

#### Step 3: Test Deployment

1. Visit your Vercel URL
2. Click "Connect with Spotify"
3. Authorize the app
4. Test all features:
   - [ ] Login works
   - [ ] Top tracks load
   - [ ] Web player initializes
   - [ ] Track playback works
   - [ ] Lyrics load
   - [ ] Similar tracks work

---

### Option 2: Railway (All-in-One)

**Best for:** Simple setup, monorepo-friendly, good free tier

**Cost:** Free $5 credit/month, pay as you go after

#### Deploy Both Services

1. **Sign up** at [railway.app](https://railway.app)

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Connect your repository

3. **Deploy Backend**
   - Add service: "New" → "GitHub Repo"
   - Root directory: `backend`
   - Add environment variables (same as Render)
   - Generate domain → Copy URL

4. **Deploy Frontend**
   - Add another service to same project
   - Root directory: `frontend`
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend.railway.app
     ```
   - Generate domain

5. **Update Backend CORS**
   - Update `FRONTEND_URL` with frontend Railway URL
   - Redeploy

---

### Option 3: AWS (Production-Grade)

**Best for:** Large scale, full control, enterprise needs

**Cost:** Varies, typically $30-100/month

#### Backend on EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install git

# Clone repository
git clone https://github.com/yourusername/smart-music-explorer.git
cd smart-music-explorer/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Paste production environment variables

# Install PM2
sudo npm install -g pm2

# Start application
pm2 start src/index.js --name music-api
pm2 startup
pm2 save

# Setup Nginx
sudo yum install nginx
sudo nano /etc/nginx/conf.d/music-api.conf
```

Nginx config:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup SSL with Let's Encrypt
sudo yum install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

#### Frontend on Vercel (or EC2)

Use Vercel steps from Option 1, or deploy to EC2:

```bash
# In frontend directory
cd ../frontend
npm install
npm run build

# Start with PM2
pm2 start npm --name music-web -- start
pm2 save
```

---

### Option 4: Docker + DigitalOcean

**Best for:** Containerized deployment, easy scaling

**Cost:** $6/month for basic droplet

#### Create Dockerfiles

Backend `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
```

Frontend `Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["npm", "start"]
```

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - SPOTIFY_CLIENT_ID=${SPOTIFY_CLIENT_ID}
      - SPOTIFY_CLIENT_SECRET=${SPOTIFY_CLIENT_SECRET}
      - SPOTIFY_REDIRECT_URI=${SPOTIFY_REDIRECT_URI}
      - LASTFM_API_KEY=${LASTFM_API_KEY}
      - GENIUS_ACCESS_TOKEN=${GENIUS_ACCESS_TOKEN}
      - FRONTEND_URL=${FRONTEND_URL}
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
    depends_on:
      - backend
    restart: unless-stopped
```

Deploy to DigitalOcean:
```bash
# Create droplet
# SSH into droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone and deploy
git clone https://github.com/yourusername/smart-music-explorer.git
cd smart-music-explorer

# Create .env file
nano .env

# Start containers
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## 🔒 Security Best Practices

### 1. Environment Variables

**Never commit sensitive data:**
```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### 2. HTTPS Everywhere

**Use SSL certificates:**
- Vercel/Render: Automatic SSL
- Custom domain: Use Let's Encrypt
- AWS: Use Certificate Manager

### 3. CORS Configuration

Update `backend/src/config/index.js`:
```javascript
CORS_ORIGINS: [
  'http://localhost:3000',
  'https://yourdomain.com',
  'https://www.yourdomain.com'
]
```

### 4. Rate Limiting

Install `express-rate-limit`:
```bash
npm install express-rate-limit
```

Add to backend:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 5. Helmet Security Headers

Already included, but verify:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## 📊 Monitoring

### Add Health Checks

Backend already has `/api/health` endpoint.

### Set Up Uptime Monitoring

Use services like:
- **UptimeRobot** (free)
- **Pingdom**
- **New Relic**
- **Datadog**

### Application Monitoring

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for usage stats

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST https://api.render.com/deploy/YOUR_SERVICE_ID

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npx vercel --prod --token $VERCEL_TOKEN
```

---

## 🧪 Pre-Deployment Testing

### Test Checklist

- [ ] Run backend locally: `npm run dev`
- [ ] Run frontend locally: `npm run dev`
- [ ] Test authentication flow
- [ ] Test Web Playback SDK
- [ ] Test all API endpoints
- [ ] Check mobile responsiveness
- [ ] Test error handling
- [ ] Verify CORS settings
- [ ] Test with different Spotify accounts
- [ ] Check browser console for errors

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test backend
ab -n 1000 -c 10 http://your-api-url/api/health

# Or use Artillery
npm install -g artillery
artillery quick --count 10 --num 50 http://your-api-url/api/health
```

---

## 📝 Post-Deployment

### 1. Update Spotify App

- Add production redirect URI
- Add production domain to allowed list
- Update app name/description if needed

### 2. Monitor Logs

```bash
# Render: Check dashboard logs
# Vercel: Check deployment logs
# Railway: Check service logs
# EC2/VPS: pm2 logs music-api
```

### 3. Set Up Alerts

Configure alerts for:
- Server downtime
- High error rates
- Slow response times
- SSL certificate expiration

### 4. Backup Strategy

Set up automated backups for:
- Environment variables
- Configuration files
- Database (if you add one later)

---

## 🆘 Troubleshooting Deployment

### Issue: "Unable to connect to backend"

**Solution:**
1. Check backend logs for errors
2. Verify environment variables are set
3. Test backend URL directly in browser
4. Check CORS settings

### Issue: "Spotify authentication fails"

**Solution:**
1. Verify redirect URI matches exactly
2. Check client ID and secret
3. Ensure HTTPS is used in production
4. Clear browser cookies and try again

### Issue: "Build fails on Vercel/Render"

**Solution:**
1. Check build logs for specific error
2. Verify all dependencies are in package.json
3. Test build locally: `npm run build`
4. Check Node.js version compatibility

### Issue: "ESLint or TypeScript errors during build"

**Solution:**
The `next.config.ts` already has `ignoreBuildErrors` and `ignoreDuringBuilds` enabled for production deployments. If you still encounter issues:
1. Verify `next.config.ts` has these settings:
   ```typescript
   typescript: {
     ignoreBuildErrors: true,
   },
   eslint: {
     ignoreDuringBuilds: true,
   },
   ```
2. Test build locally: `npm run build`
3. Fix type errors gradually in development

### Issue: "Web Player doesn't work"

**Solution:**
1. Verify Spotify Premium account
2. Check browser console for errors
3. Verify Web Playback SDK is loaded
4. Check domain is allowed in Spotify app settings

---

## 📞 Need Help?

- **Documentation**: Check README.md
- **Issues**: GitHub Issues
- **Community**: Discord/Slack
- **Email**: support@yourdomain.com

---

**Happy Deploying! 🚀**
