# 🔧 MediaVault Troubleshooting Guide

## Error: "Failed to load gallery: Unexpected token 'T', "The page c"..."

### ❌ What This Means
The API returned HTML instead of JSON. This usually means:
1. **Missing Cloudinary credentials** in `.env`
2. **Invalid API credentials**
3. **Server error** (check server logs)

### ✅ Solution

#### Step 1: Verify Environment Variables
```bash
# Check if .env exists
cat .env

# Should have these (fill in your actual values):
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

If missing, create/update `.env`:
```bash
cp .env.example .env
# Edit with your real Cloudinary credentials
```

#### Step 2: Verify Credentials
Check your Cloudinary dashboard:
1. Go to https://cloudinary.com/console
2. Check your **Cloud Name**
3. Check your **API Key**
4. Check your **API Secret** (never share this!)

#### Step 3: Check Server Health
```bash
# In browser or terminal, visit:
http://localhost:5000/api/health

# Should return:
{
  "status": "ok",
  "cloudinary_configured": true,
  "cloud_name": "your_cloud_name",
  "timestamp": "..."
}
```

#### Step 4: Restart Server
```bash
# Kill current server (Ctrl+C)
# Restart:
npm start
```

#### Step 5: Check Browser Console
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for detailed error messages
4. Report them if following these steps doesn't help

---

## Other Common Errors

### ❌ "Cloudinary not configured"

**Cause**: Environment variables not set

**Fix**:
```bash
# Make sure .env file exists and has:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Restart server after editing
```

### ❌ "Upload failed"

**Cause**: File too large or invalid credentials

**Fix**:
1. Try a smaller image (< 10MB)
2. Verify credentials (step above)
3. Check file is actually an image
4. Check console for exact error

### ❌ "Cannot connect to server"

**Cause**: Server not running or port already in use

**Fix**:
```bash
# Start server
npm start

# Or use different port
PORT=3000 npm start
```

### ❌ "Port 5000 already in use"

**Cause**: Another process using port 5000

**Fix**:
```bash
# Option 1: Use different port
PORT=3000 npm start

# Option 2: Kill process using port 5000
# On Linux/Mac:
lsof -i :5000  # Find process ID
kill -9 <PID>  # Kill it

# On Windows:
netstat -ano | findstr :5000  # Find process ID
taskkill /PID <PID> /F  # Kill it
```

### ❌ "No images appear in gallery"

**Cause**: No images uploaded yet or API error

**Fix**:
1. Try uploading an image
2. Check server console for errors
3. Visit `/api/health` to verify server
4. Check `/api/assets` endpoint manually in browser

### ❌ "Image transformation doesn't work"

**Cause**: Invalid public_id or transformation parameters

**Fix**:
1. Make sure you selected an image from gallery or entered correct public_id
2. Try basic transformation first (just resize)
3. Check browser console for errors

---

## Debugging Steps

### Check Server Console
When running `npm start`, watch the console output:
```
✓ MediaVault Server running on http://localhost:5000
✓ Cloudinary Cloud: your_cloud_name
✓ Environment: development
✓ API Health: http://localhost:5000/api/health
```

Look for error messages like:
```
Cloudinary API Error: ...
Assets endpoint error: ...
Upload error: ...
```

### Check Browser Console (F12)
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for red errors
4. Check **Network** tab to see API responses

### Test API Directly

```bash
# Test health check
curl http://localhost:5000/api/health

# Test assets endpoint
curl http://localhost:5000/api/assets

# Should show JSON response
```

### Enable Debug Logging

Edit `server.js` and add:
```javascript
// Add at top of file
console.log('Environment Variables:', {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
});
```

---

## Development vs Production

### Development Mode
```bash
npm start
# Logs all errors to console
# Slower but more debugging info
```

### Production Mode
```bash
NODE_ENV=production npm start
# Faster but less logging
```

---

## Fresh Start

If nothing works, try a complete fresh start:

```bash
# 1. Stop server (Ctrl+C)

# 2. Clear modules
rm -rf node_modules
rm package-lock.json

# 3. Reinstall
npm install

# 4. Verify credentials in .env
cat .env
# Update if needed

# 5. Start fresh
npm start

# 6. Test at http://localhost:5000
```

---

## Getting Help

### Check These First
- ✅ `.env` file exists and has correct credentials
- ✅ Server is running (`npm start`)
- ✅ You can access http://localhost:5000
- ✅ `/api/health` returns valid JSON
- ✅ Browser console (F12) shows no errors

### Provide This Info When Asking for Help
1. Full error message from browser console
2. Server console output (when you ran `npm start`)
3. Output of `npm list cloudinary`
4. Output of `/api/health` endpoint
5. What version of Node.js: `node --version`

### Resources
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [API Status](https://status.cloudinary.com)
- [Cloudinary Support](https://support.cloudinary.com)

---

## Verification Checklist

Before reporting an issue, verify:

- [ ] `.env` file exists
- [ ] All credentials in `.env` are correct
- [ ] Server starts without errors
- [ ] `/api/health` returns status: ok
- [ ] Browser console shows no errors
- [ ] You tried uploading a test image
- [ ] You tried in a private/incognito window
- [ ] You restarted the server after changing .env

---

## Common Solutions

| Issue | Solution |
|-------|----------|
| Gallery won't load | Check `/api/health`, verify .env |
| Upload fails | Check file size, verify credentials |
| Transformations don't work | Enter correct public_id, try basic resize |
| Port already in use | Use different port or kill process |
| Server won't start | Check Node.js version, run `npm install` |
| Images won't display | Check Cloudinary URL, verify permissions |

---

**Still having issues? Check `/api/health` first, then check the browser console!**
