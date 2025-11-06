# 🚀 Deployment Guide - 3D Beat Synth

This guide provides step-by-step instructions for deploying the 3D Beat Synth app to various platforms.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:
- ✅ All code is committed to Git
- ✅ `npm run build` runs successfully
- ✅ The app works correctly in production mode: `npm run preview`
- ✅ All tests pass (optional but recommended)

---

## 🎯 Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest and fastest way to deploy Vite apps.

### Method A: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Log in to your Vercel account
   - Select your project settings
   - Confirm deployment

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Method B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the Vite configuration
5. Click "Deploy"

**That's it!** Your app will be live at `https://your-project.vercel.app`

### Configuration

The `vercel.json` file is already configured with:
- Build command: `npm run build`
- Output directory: `dist`
- SPA routing support
- CORS headers for SharedArrayBuffer (required for MediaPipe)

---

## 🎨 Option 2: Deploy to Netlify

### Method A: Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the app**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy
   ```

4. **Deploy to Production**:
   ```bash
   netlify deploy --prod
   ```

### Method B: Netlify Dashboard

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub)
4. Select your repository
5. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

**Live URL**: `https://your-site-name.netlify.app`

---

## 📦 Option 3: Deploy to GitHub Pages

GitHub Pages is free and perfect for open-source projects.

### Automatic Deployment (Recommended)

1. **Enable GitHub Pages**:
   - Go to your GitHub repository
   - Settings → Pages
   - Source: "GitHub Actions"

2. **Push the workflow file**:
   The `.github/workflows/deploy.yml` file is already configured.

3. **Trigger deployment**:
   ```bash
   git push origin main
   ```

4. **Access your site**:
   `https://yourusername.github.io/3D-Beat-Synth`

### Manual Deployment

1. **Install gh-pages**:
   ```bash
   npm install -D gh-pages
   ```

2. **Add deploy script to `package.json`**:
   ```json
   {
     "scripts": {
       "deploy": "vite build && gh-pages -d dist"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

---

## 🌐 Option 4: Deploy to Other Platforms

### Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy

**URL**: `https://your-project.pages.dev`

### Railway

1. Go to [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects the configuration
5. Deploy

### Render

1. Go to [render.com](https://render.com)
2. "New" → "Static Site"
3. Connect your repository
4. Settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Create Static Site

---

## 🔧 Important Notes

### Camera Permissions

The app requires camera access for hand tracking. Users will see a browser permission prompt on first use.

**Note**: Some browsers block camera access on non-HTTPS sites. All recommended deployment platforms provide HTTPS by default.

### CORS Headers

The app requires specific headers for SharedArrayBuffer (used by MediaPipe):
- `Cross-Origin-Embedder-Policy: credentialless`
- `Cross-Origin-Opener-Policy: same-origin`

These are configured in `vercel.json` and `netlify.toml`.

### External Dependencies

The app loads these libraries from CDN:
- Three.js (0.164.1)
- Tone.js (14.7.77)
- MediaPipe Vision (0.10.3)
- Tailwind CSS

Ensure your deployment platform allows external script loading.

---

## 🧪 Test Your Deployment

After deployment, test these features:

1. ✅ **Camera Access**: Allow camera permissions
2. ✅ **Hand Tracking**: Enable hand tracking toggle
3. ✅ **Shape Selection**: Change shapes in dropdown
4. ✅ **Performance Mode**: Toggle performance mode
5. ✅ **Audio**: Enable drone sound (may require user interaction first)
6. ✅ **Textures**: Apply sample textures
7. ✅ **Mobile**: Test on mobile device

---

## 📊 Performance Optimization

For production deployments, consider:

1. **Enable Gzip/Brotli compression** (usually automatic on platforms)
2. **CDN caching** (Vercel/Netlify do this automatically)
3. **Performance mode** for mobile users (toggle in app)

---

## 🐛 Troubleshooting

### Issue: Camera not working
- **Solution**: Ensure HTTPS is enabled (all platforms provide this)
- Check browser camera permissions

### Issue: Hand tracking not loading
- **Solution**: Check browser console for CORS errors
- Verify CORS headers are set correctly

### Issue: Audio not playing
- **Solution**: User must interact with page first (browser requirement)
- Click "Drone Sound" button to initialize audio context

### Issue: Blank page after deployment
- **Solution**: Check build logs for errors
- Verify `dist` folder is being deployed
- Check browser console for errors

---

## 🔄 Continuous Deployment

All recommended platforms support automatic deployment:

- **Push to `main` branch** → Automatic deployment
- **Pull request** → Preview deployment (Vercel/Netlify)
- **Custom branches** → Branch preview URLs

---

## 📝 Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS

### GitHub Pages
1. Settings → Pages → Custom domain
2. Add CNAME record to your DNS

---

## 🎉 Quick Start Commands

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# GitHub Pages (push to trigger)
git push origin main

# Manual build and preview
npm run build
npm run preview
```

---

## 🆘 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **GitHub Pages Docs**: [docs.github.com/pages](https://docs.github.com/pages)

---

## ✅ Deployment Checklist

- [ ] Build succeeds locally (`npm run build`)
- [ ] App works in preview mode (`npm run preview`)
- [ ] Deployment configuration file created
- [ ] Git repository is up to date
- [ ] Platform account created
- [ ] Repository connected to platform
- [ ] Deployment successful
- [ ] App accessible via URL
- [ ] Camera permissions work
- [ ] Hand tracking works
- [ ] Audio works
- [ ] Mobile responsive
- [ ] Custom domain configured (optional)

---

**Recommended**: Start with Vercel for the fastest deployment experience! 🚀
