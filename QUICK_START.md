# ⚡ Quick Start - MediaVault in 5 Minutes

Get MediaVault running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

That's it! All dependencies will be installed.

## Step 2: Setup Environment (1 min)

Create `.env` file with your credentials:

```bash
cat > .env << EOF
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
EOF
```

## Step 3: Start the Server (1 min)

```bash
npm start
```

You should see:
```
✓ Server running on http://localhost:5000
✓ Cloudinary Cloud: your_cloud_name
```

## Step 4: Open in Browser (1 min)

Visit: http://localhost:5000

🎉 You're done!

## Step 5: Try It Out (1 min)

1. **Upload**: Drag an image to the upload area
2. **View**: See it in the gallery
3. **Transform**: Apply effects and resize
4. **Analyze**: View transformation variants
5. **Delete**: Remove images

---

## 🎯 What's Happening?

| What | Why | How |
|------|-----|-----|
| Upload | Store media assets securely | Multipart form upload → Cloudinary API |
| Library | Browse and manage all assets | List assets → Cloudinary Admin API |
| Transform | Professional image optimization | URL generation with smart transformations |
| Analyze | Understand media performance | Generate optimized variants for all devices |
| Delete | Remove obsolete media | Call delete endpoint → Cloudinary API |

## 🚀 Ready for More?

### Enhance the Project
- Add database for user data
- Add authentication
- Add advanced transformations
- Add AI features
- Deploy to production

### Learn More
- [Full README](README.md) - Complete documentation
- [Features Guide](FEATURES.md) - All capabilities
- [Deployment Guide](DEPLOYMENT.md) - Go live
- [Creator Community](CREATOR_COMMUNITY.md) - Submit to community

### Explore APIs
- [Upload API](https://cloudinary.com/documentation/upload_api_reference)
- [Admin API](https://cloudinary.com/documentation/admin_api)
- [Transformations](https://cloudinary.com/documentation/image_transformation_reference)

## ⚠️ Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution**: Run `npm install` again

### Issue: "Cloudinary credentials not configured"
**Solution**: Check your `.env` file has correct values

### Issue: "Port 5000 already in use"
**Solution**: Use different port: `PORT=3000 npm start`

### Issue: Uploads fail
**Solution**: Check Cloudinary credentials are correct

### Issue: Images don't appear in gallery
**Solution**: Verify API key is correct, check browser console

## 💡 Pro Tips

1. **Development**: Use `npm run dev` for auto-reload (install nodemon first)
2. **Debug**: Open browser DevTools (F12) to see network requests
3. **Test**: Try with different image formats (PNG, JPEG, GIF, WebP)
4. **Learn**: Read the server.js code to understand API calls

## 🎓 Next Learning Steps

1. **Week 1**: Get familiar with basic upload and transformations
2. **Week 2**: Explore asset management and organization
3. **Week 3**: Try advanced transformations and effects
4. **Week 4**: Prepare for Creator Community submission

## 📞 Need Help?

- Check [README.md](README.md) for details
- Visit [Cloudinary Docs](https://cloudinary.com/documentation)
- Ask [Support](https://support.cloudinary.com)
- Check [GitHub Issues](https://github.com/cloudinary/cloudinary-js)

## ✅ Your Journey

```
Created project ✓
Installed dependencies ✓
Setup credentials ✓
Started server ✓
Accessed in browser ✓
→ Next: Explore features!
```

---

**Enjoy exploring Cloudinary! 🚀**

*Questions? Check the other docs or visit support.cloudinary.com*
