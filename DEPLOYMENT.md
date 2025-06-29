# StayFinder Deployment Guide

## 🚀 Deploy to Railway (Recommended)

Railway offers a generous free tier and is perfect for full-stack applications.

### Prerequisites
1. GitHub account
2. Railway account (free at railway.app)
3. MongoDB Atlas account (free tier)

### Step 1: Prepare MongoDB
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Create a database user

### Step 2: Deploy Backend
1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set the root directory to `server/`
5. Add environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```
6. Deploy

### Step 3: Deploy Frontend
1. In Railway, click "New Service" → "GitHub Repo"
2. Select the same repository
3. Set root directory to `/` (root)
4. Add environment variable:
   ```
   VITE_SERVER_URL=https://your-backend-url.railway.app
   ```
5. Deploy

### Step 4: Configure Domains
1. Railway will provide URLs for both services
2. Update your frontend's `VITE_SERVER_URL` with the backend URL
3. Optionally, add custom domains

## 🔧 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stayfinder
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=production
```

### Frontend (.env)
```
VITE_SERVER_URL=https://your-backend-url.railway.app
```

## 📊 Railway Free Tier Limits
- **Monthly Usage**: $5 credit (usually enough for 100+ users)
- **Build Time**: Unlimited
- **Deployments**: Unlimited
- **Custom Domains**: Yes
- **SSL**: Automatic

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
2. **API calls fail**: Verify VITE_SERVER_URL is correct
3. **Database connection fails**: Check MONGODB_URI format
4. **Images not loading**: Ensure static file serving is configured

### Railway Commands:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up

# View logs
railway logs
```

## 📈 Scaling
When you exceed the free tier:
1. Railway will notify you
2. Upgrade to paid plan ($5/month for more resources)
3. Or migrate to other platforms (Vercel, Netlify, etc.)

## 🔄 Continuous Deployment
Railway automatically deploys when you push to your main branch. 