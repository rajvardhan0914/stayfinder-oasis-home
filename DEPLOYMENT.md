# StayFinder Deployment Guide

## 🚀 Current Deployment Setup

**Backend**: Deployed on Render  
**Frontend**: Deployed on Vercel

## 🎯 Render Backend Deployment (Current)

### Prerequisites
1. GitHub account
2. Render account (free at render.com)
3. Vercel account (free at vercel.com)
4. MongoDB Atlas account (free tier)

### Step 1: Prepare MongoDB
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Create a database user

### Step 2: Deploy Backend (Render)
1. Go to [Render](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Set the root directory to `server/`
5. Add environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ADMIN_EMAIL=your_admin_email@example.com
   ADMIN_PASSWORD=your_secure_admin_password
   PORT=5000
   NODE_ENV=production
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
6. Deploy

### Step 3: Deploy Frontend (Vercel)
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
4. Deploy

### Step 4: Configure Domains
1. Render will provide your backend URL (e.g., `https://your-app.onrender.com`)
2. Update your frontend's `VITE_API_URL` with the Render backend URL
3. Optionally, add custom domains

## 🔧 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stayfinder
JWT_SECRET=your_super_secret_jwt_key_here
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=your_secure_admin_password
PORT=5000
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.onrender.com
```

## 📊 Platform Free Tier Limits

### Render (Backend)
- **Free Tier**: 750 hours/month (usually enough for 24/7 operation)
- **Build Time**: 90 minutes
- **Deployments**: Unlimited
- **Custom Domains**: Yes
- **SSL**: Automatic
- **Sleep**: Services sleep after 15 minutes of inactivity

### Vercel (Frontend)
- **Free Tier**: Unlimited static sites
- **Build Time**: 100GB-hours/month
- **Deployments**: Unlimited
- **Custom Domains**: Yes
- **SSL**: Automatic
- **Edge Functions**: 100GB-hours/month

## 🔒 Security Checklist
- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB connection uses authentication
- [ ] Environment variables are set
- [ ] Helmet middleware is active
- [ ] CORS is configured
- [ ] Rate limiting is implemented

## 🚨 Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version compatibility
2. **API calls fail**: Verify VITE_API_URL is correct
3. **Database connection fails**: Check MONGODB_URI format
4. **Images not loading**: Ensure static file serving is configured
5. **Render service sleeping**: First request after sleep takes ~30 seconds (normal behavior)
6. **CORS errors**: Ensure your backend allows your frontend domain

### Render-Specific Issues:
- **Cold starts**: First request after inactivity takes longer
- **Memory limits**: Free tier has 512MB RAM limit
- **Build timeout**: 90-minute build limit on free tier
- **Auto-deploy**: Only deploys from main/master branch by default

### Render Commands:
```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Deploy
render deploy

# View logs
render logs
```

## 📈 Scaling
When you exceed the free tier:
1. Render will notify you
2. Upgrade to paid plan ($7/month for more resources)
3. Or migrate to other platforms (Railway, Heroku, etc.)

## 🔄 Continuous Deployment
Render automatically deploys when you push to your main branch. 