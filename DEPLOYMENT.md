# 🚀 Deployment Guide

This guide covers deploying the Cloudinary Creator Portfolio to various platforms.

## Prerequisites

- Cloudinary account with API credentials
- Node.js application built and tested locally
- Git repository (optional but recommended)

## 🎯 Quick Deployment Options

### 1. Heroku (Recommended for Beginners)

**Step 1: Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows (via npm)
npm install -g heroku
```

**Step 2: Login to Heroku**
```bash
heroku login
```

**Step 3: Create App**
```bash
heroku create your-cloudinary-portfolio
```

**Step 4: Set Environment Variables**
```bash
heroku config:set CLOUDINARY_CLOUD_NAME=your_cloud_name
heroku config:set CLOUDINARY_API_KEY=your_api_key
heroku config:set CLOUDINARY_API_SECRET=your_api_secret
```

**Step 5: Deploy**
```bash
git push heroku main
```

**Step 6: Open App**
```bash
heroku open
```

### 2. Render (Simple & Free)

1. Push code to GitHub
2. Go to https://render.com
3. Click "New +" → "Web Service"
4. Connect GitHub repository
5. Set environment variables:
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
6. Deploy!

### 3. Vercel

1. Push the repository to GitHub and import it at https://vercel.com.
2. Open **Project Settings → Environment Variables**.
3. Add these variables for **Production**, **Preview**, and **Development** as needed:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Open **Deployments**, select the latest deployment, and choose **Redeploy** so the functions receive the variables.
5. Verify `https://your-project.vercel.app/api/health` returns JSON with `"cloudinary_configured": true`.

The repository includes `vercel.json` and serverless functions in `api/`. Do not set `public` as a static-only output directory; the `/api/*` functions must be deployed with the frontend.

### 4. Railway

1. Go to https://railway.app
2. Create new project from GitHub
3. Add environment variables
4. Deploy!

### 5. Self-Hosted (VPS/EC2)

**On your server:**

```bash
# Clone repository
git clone your-repo.git
cd your-app

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your Cloudinary credentials

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start server.js --name "cloudinary-portfolio"

# Setup auto-restart
pm2 startup
pm2 save
```

**Nginx Configuration** (if using reverse proxy):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Environment Setup Checklist

- [ ] Node.js installed (v14+)
- [ ] npm/yarn available
- [ ] Cloudinary account created
- [ ] API credentials obtained
- [ ] PORT variable set (default: 5000)
- [ ] NODE_ENV set to 'production'
- [ ] HTTPS enabled (for production)

## 🔒 Production Checklist

- [ ] Use environment variables (not hardcoded)
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure CORS if needed
- [ ] Add rate limiting
- [ ] Set up monitoring/logging
- [ ] Regular backups
- [ ] Update dependencies regularly

## 🧪 Test Your Deployment

1. Visit your deployed URL
2. Test file upload
3. Test transformations
4. Test asset deletion
5. Check browser console for errors
6. Monitor server logs

## 🔧 Troubleshooting

### App won't start
```bash
# Check logs
heroku logs --tail

# Verify .env variables are set
heroku config
```

### 503 Service Unavailable
- Check server logs
- Verify Cloudinary credentials
- Check network connectivity

### Uploads not working
- Confirm CLOUDINARY credentials
- Check file upload size limits
- Verify CORS settings

### Slow performance
- Enable Cloudinary CDN caching
- Use f_auto and q_auto
- Optimize image sizes

## 📈 Monitoring & Analytics

### Heroku
```bash
heroku logs --tail
heroku ps
heroku metrics
```

### Render
- Dashboard shows live logs and metrics

### Cloudinary
- Monitor usage in Cloudinary Dashboard
- Track bandwidth and transformations
- Analyze asset performance

## 🎯 Next Steps After Deployment

1. **Custom Domain**: Set up custom domain
2. **SSL Certificate**: Enable HTTPS
3. **Analytics**: Add Google Analytics
4. **Monitoring**: Setup error tracking (Sentry)
5. **Backup**: Regular automated backups
6. **CI/CD**: Setup automatic deployments

## 💡 Pro Tips

- Use CDN for static assets
- Enable Cloudinary URL signing for security
- Setup webhook notifications
- Use named transformations for consistency
- Monitor rate limits and adjust as needed
- Cache API responses when possible

## 🆘 Getting Help

- **Deployment Issues**: Check platform documentation
- **Cloudinary Issues**: Contact support.cloudinary.com
- **Node.js Issues**: Search on Stack Overflow
- **General Advice**: Check Cloudinary community forums

---

**Happy Deploying! 🎉**
