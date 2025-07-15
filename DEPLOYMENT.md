# Deployment Guide for Render

## Prerequisites

1. A GitHub account with your code pushed to a repository
2. A Render account (sign up at https://render.com)
3. Your Supabase credentials (if using Supabase backend)

## Deployment Steps

### 1. Push Code to GitHub

Make sure your code is in a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit - FunMusic app"
git branch -M main
git remote add origin https://github.com/yourusername/funmusic.git
git push -u origin main
```

### 2. Create a Static Site on Render

1. Go to https://render.com and sign in
2. Click "New +" and select "Static Site"
3. Connect your GitHub repository
4. Configure the build settings:
   - **Name**: funmusic (or your preferred name)
   - **Branch**: main
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

### 3. Add Environment Variables (if using Supabase)

In your Render dashboard:
1. Go to your static site settings
2. Click on "Environment"
3. Add the following environment variables:
   - `REACT_APP_SUPABASE_URL`: Your Supabase project URL
   - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### 4. Deploy

1. Click "Create Static Site"
2. Render will automatically build and deploy your app
3. Your app will be available at: `https://your-app-name.onrender.com`

## Build Configuration

The project includes:
- `render.yaml` for automatic deployment configuration
- Route rewriting for React Router (SPA support)
- Production optimized build settings

## Troubleshooting

### Build Failures
- Check that all dependencies are in package.json
- Ensure Node.js version compatibility
- Review build logs in Render dashboard

### Audio File Issues
- Ensure audio files are accessible via HTTPS
- Check CORS settings for external audio sources
- Consider using Supabase Storage for audio files

### Environment Variables
- Make sure all required environment variables are set
- Use REACT_APP_ prefix for client-side variables
- Don't commit sensitive keys to version control

## Post-Deployment

1. Test all functionality on the live site
2. Set up custom domain (optional)
3. Configure monitoring and analytics
4. Set up automatic deployments from GitHub

## Performance Optimization

Consider these optimizations for production:
1. Implement lazy loading for components
2. Optimize audio file formats and sizes
3. Add service worker for offline support
4. Implement CDN for static assets
