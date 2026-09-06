# Deployment Instructions

## GitHub Pages Deployment

1. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Optimized build for deployment"
   git push origin main
   ```

2. **Enable GitHub Pages:**

   - Go to your repository settings
   - Scroll to "Pages" section
   - Set source to "Deploy from a branch"
   - Select "main" branch
   - Set folder to "/ (root)" or "/dist" if you want to use the dist folder
   - Enable "Enforce HTTPS"

3. **Your game will be available at:**
   `https://yourusername.github.io/floodguard-india/`

## Manual Deployment (Alternative)

If you want to deploy the dist folder manually:

1. Copy the contents of the `dist` folder
2. Upload to any web hosting service
3. Make sure to serve `index.html` as the main file

## Performance Tips

- The service worker will cache assets for faster loading
- Critical assets are preloaded
- Videos and large assets are loaded on demand
- The game should load much faster after the first visit

## Troubleshooting

### Common Issues and Solutions

1. **Black Screen on Deployment**

   - ✅ **FIXED**: Missing asset paths corrected
   - ✅ **FIXED**: Added error handling and debugging
   - ✅ **FIXED**: Canvas sizing issues resolved
   - ✅ **FIXED**: Phaser import issues resolved (using CDN)
   - Check browser console for specific error messages

2. **Assets Not Loading**

   - ✅ **FIXED**: All asset paths updated to use `./assets/` format
   - ✅ **FIXED**: Missing assets replaced with existing ones
   - Clear browser cache if you see old versions

3. **Canvas Display Issues**

   - ✅ **FIXED**: Added responsive canvas sizing
   - ✅ **FIXED**: Added proper CSS for canvas display
   - Check if viewport meta tag is present

4. **Performance Issues**
   - ✅ **FIXED**: Reduced parallel downloads for stability
   - ✅ **FIXED**: Increased timeout for slow connections
   - ✅ **FIXED**: Added asset preloading

### Debug Steps

1. **Open deploy-test.html** in your browser to run diagnostics
2. **Check browser console** for error messages
3. **Verify all assets load** by checking Network tab
4. **Test on different devices** and screen sizes

### Deployment Checklist

- [ ] All asset paths use `./assets/` format
- [ ] Canvas sizing is responsive
- [ ] Error handling is in place
- [ ] Service worker is registered (optional)
- [ ] HTTPS is enabled (recommended)
- [ ] All critical assets are preloaded
