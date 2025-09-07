# 🔒 Security Setup Guide

## ⚠️ CRITICAL: Admin Credentials Security

Your admin credentials were previously hardcoded in the createAdminUser.ts script, which is a **major security vulnerability**. This has been fixed to use environment variables, but you need to set up secure credentials immediately.

## 🚨 Immediate Actions Required:

### 1. Create Environment Variables
Create a `.env` file in your `server/` directory with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/stayfinder

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production

# Admin Credentials (NEVER commit these to git!)
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=your-secure-admin-password

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
```

### 2. Generate Secure Credentials
- **JWT_SECRET**: Generate a random 32+ character string
- **ADMIN_PASSWORD**: Use a strong password (12+ characters, mix of letters, numbers, symbols)
- **ADMIN_EMAIL**: Use a secure email address

### 3. Hash Your Admin Password (Recommended)
For extra security, hash your admin password:

```bash
# In your server directory
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
```

Then use the hashed output as your `ADMIN_PASSWORD` in the `.env` file.

### 4. Restart Your Server
After setting up the environment variables, restart your server:

```bash
cd server
npm run dev
```

## 🔐 Security Improvements Made:

1. ✅ **Removed hardcoded credentials** from frontend code
2. ✅ **Added secure JWT authentication** for admin login
3. ✅ **Environment variable configuration** for sensitive data
4. ✅ **Proper password hashing** support
5. ✅ **Secure token-based authentication** instead of simple string matching

## 🛡️ Additional Security Recommendations:

1. **Use HTTPS** in production
2. **Rate limiting** on admin login endpoints
3. **Two-factor authentication** for admin accounts
4. **Regular security audits**
5. **Keep dependencies updated**
6. **Use environment-specific configurations**

## 🚫 What Was Fixed:

- ❌ Client-side credential validation
- ❌ Insecure token storage

## ✅ What's Now Secure:

- ✅ Server-side credential validation
- ✅ Environment variable configuration
- ✅ JWT token authentication
- ✅ Proper password hashing
- ✅ Secure token storage

## 🔍 Testing Your Setup:

1. Set up your `.env` file with secure credentials
2. Restart your server
3. Try logging in with your new admin credentials
4. Verify that the old hardcoded credentials no longer work

## 📞 Need Help?

If you encounter any issues with the security setup, please:
1. Check that your `.env` file is properly configured
2. Ensure your server is restarted after changes
3. Verify that the environment variables are being loaded correctly

**Remember: Never commit your `.env` file to version control!** 