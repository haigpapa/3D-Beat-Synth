<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎵 3D Beat Synth

An interactive audiovisual web application that uses camera-based hand gestures to control 3D shape visualization and generate sound in real-time.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/haigpapa/3D-Beat-Synth)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/haigpapa/3D-Beat-Synth)

View your app in AI Studio: https://ai.studio/apps/drive/1pNO9aRh6-hLBaCsmy_pS_MiiIpPhSDLI

---

## ✨ Features

- 🤚 **Hand Gesture Control**: Use your hands to control shapes and sound
  - **Left Hand**: Controls shape scale, color, and rotation
  - **Right Hand**: Duplicates shapes based on lifted fingers
- 🎵 **Real-Time Audio Synthesis**: Tone.js-powered audio engine with dual synths
- 🎨 **8 Geometric Shapes**: Sphere, Cube, Torus, Cone, Cylinder, Dodecahedron, Octahedron, Tetrahedron
- ⚡ **Performance Mode**: Optimized rendering for lower-end devices
- 📱 **Mobile Responsive**: Works great on all screen sizes
- 🎭 **Custom Textures**: Upload your own or use built-in patterns
- 📊 **Real-Time Data Display**: Live hand tracking metrics and musical scale info

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **A modern browser** with camera access
- **Internet connection** (for CDN libraries)

### Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/haigpapa/3D-Beat-Synth.git
   cd 3D-Beat-Synth
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000`

5. **Allow camera permissions** when prompted

---

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Deploy to GitHub Pages

Push to `main` branch - GitHub Actions will automatically deploy.

📖 **Full deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 🎮 How to Use

1. **Enable Hand Tracking**: Toggle the "Hand Tracking" switch in Controls
2. **Allow Camera Access**: Grant camera permissions when prompted
3. **Use Your Hands**:
   - **Left Hand**: Pinch thumb-pinky to scale, thumb-index for color, move hand for rotation
   - **Right Hand**: Raise fingers to duplicate shapes (1 finger = 1 copy)
4. **Explore Features**:
   - Change shapes via dropdown
   - Toggle Performance Mode for better FPS
   - Enable Drone Sound for continuous audio
   - Apply textures from samples or upload your own

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript 5.8
- **3D Graphics**: Three.js 0.164
- **Audio**: Tone.js 14.7
- **Hand Tracking**: MediaPipe Vision 0.10
- **Build Tool**: Vite 6.2
- **Styling**: Tailwind CSS
- **Testing**: Playwright 1.55

---

## 📂 Project Structure

```
3D-Beat-Synth/
├── components/           # React components
│   ├── Visualizer.tsx   # Main 3D scene + hand tracking
│   ├── Header.tsx       # Title + controls
│   ├── InfoPanels.tsx   # Real-time data display
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
│   ├── useHandTracking.ts
│   ├── useAudioSynth.ts
│   └── useThreeScene.ts
├── types/               # TypeScript definitions
├── tests/               # Playwright test suite
├── App.tsx              # Root component
└── index.html          # Entry point
```

---

## 🧪 Testing

Run the test suite:

```bash
npx playwright test
```

Run tests with UI:

```bash
npx playwright test --ui
```

Test coverage includes:
- UI interactions (40+ tests)
- Accessibility compliance
- Shape selector functionality
- Texture controls
- Info panels

---

## 📚 Documentation

- **[IMPROVEMENTS.md](IMPROVEMENTS.md)**: Comprehensive guide to all improvements made
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Step-by-step deployment instructions
- **Type Definitions**: See `types/` for complete TypeScript types

---

## 🎯 Performance

- **Normal Mode**: 60 FPS, high-quality geometry, post-processing effects
- **Performance Mode**: 30 FPS, optimized geometry, 2-3x better performance
- **Mobile Optimized**: Responsive layout, touch-friendly controls
- **Bundle Size**: 718 KB (195 KB gzipped)

---

## 🌐 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Requires HTTPS for camera access (automatic on all deployment platforms)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- **Three.js** for 3D rendering
- **Tone.js** for audio synthesis
- **MediaPipe** for hand tracking
- **Vite** for blazing fast development

---

## 📞 Support

Need help? Check out:
- [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
- [IMPROVEMENTS.md](IMPROVEMENTS.md) for feature documentation
- Open an issue on GitHub

---

**Made with ❤️ and hand gestures** 🤚🎵
