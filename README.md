# 🐠 AquaVision

> AI-powered aquarium water test strip analyzer — snap a photo, get instant expert water quality analysis.

![AquaVision](https://img.shields.io/badge/powered%20by-Claude%20AI-7dd3fc?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)

---

## ✨ What It Does

Upload a photo of your **Tetra EasyStrips** water test results and AquaVision will:

- 🔬 Read each test pad color and estimate parameter values
- 🐠 Analyze multiple strips at once (one per tank)
- ⚠️ Flag parameters outside safe ranges with color-coded status
- 📋 Give you immediate and short-term action plans
- 🎓 Provide an expert aquarist verdict

**Supports:**
- Tetra EasyStrips 5-in-1 (Nitrate, Nitrite, Hardness GH, Alkalinity KH, pH)
- Tetra EasyStrips Ammonia (NH₃/NH₄⁺)
- Both strip types in a single photo

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/aquavision.git
cd aquavision
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up your API key
```bash
cp .env.example .env
```

Then open `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Get a free API key at: https://console.anthropic.com

### 4. Run locally
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## ☁️ Deploy to Vercel (Recommended)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aquavision.git
git push -u origin main
```

### 2. Import to Vercel
- Go to https://vercel.com
- Click "Add New Project"
- Import your GitHub repository

### 3. Add Environment Variable
In Vercel dashboard → Settings → Environment Variables:

- **Name:** `ANTHROPIC_API_KEY` (not VITE_ANTHROPIC_API_KEY)
- **Value:** Your API key from console.anthropic.com
- **Environments:** ✅ Production ✅ Preview ✅ Development

### 4. Deploy
Click "Deploy" — done! Your API key stays secure server-side.

---

## 📁 Project Structure

```
aquavision/
├── api/
│   └── analyze.js          # Serverless API endpoint (proxies Anthropic)
├── public/
│   └── favicon.svg         # App icon
├── src/
│   ├── main.jsx           # React entry point
│   ├── App.jsx            # Root component
│   └── AquaVision.jsx     # Main app (UI + logic)
├── .env.example           # Template for environment variables
├── .gitignore             # Git ignore rules
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
├── vercel.json            # Vercel deployment config
├── vite.config.js         # Vite configuration
└── README.md              # This file
```

---

## 🔧 How It Works

1. **User uploads photo** → Image converted to base64 in browser
2. **Sent to serverless API** → `/api/analyze` receives the request
3. **Server calls Claude API** → Serverless function proxies to Anthropic
4. **AI reads strips** → Claude analyzes colors against Tetra reference chart
5. **Returns structured data** → JSON with readings, safety status, and actions
6. **UI renders results** → Color-coded cards per tank with expert recommendations

### Why a Serverless API?

- ✅ **Security:** API key stays server-side (not exposed in browser)
- ✅ **CORS:** No cross-origin issues
- ✅ **Simple:** Just one file (`api/analyze.js`)

### Safe Parameter Ranges

| Parameter | Safe Range |
|-----------|-----------|
| Nitrate NO₃ | < 20 ppm |
| Nitrite NO₂ | 0 ppm |
| Hardness GH | 75–150 ppm |
| Alkalinity KH | 80–120 ppm |
| pH | 6.8–7.8 |
| Ammonia NH₃ | 0 ppm |

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool and dev server
- **Vercel Serverless Functions** — Backend API proxy
- **Anthropic Claude API** — Vision AI (claude-sonnet-4-20250514)
- **Pure CSS-in-JS** — No UI library dependencies

---

## 🗺️ Roadmap

- [x] Serverless API for secure key storage
- [ ] Test history tracking per tank
- [ ] Fish species profiles with custom safe ranges
- [ ] Dosing calculator
- [ ] PWA support (installable on mobile)
- [ ] PDF export of results
- [ ] Push notifications for parameter alerts

---

## 🔒 Security

Your API key is **never exposed to the browser**. The serverless function at `/api/analyze` handles all Anthropic API calls server-side.

**For local development:** API key in `.env` (never commit this file)  
**For production:** API key in Vercel environment variables

---

## 📝 License

MIT License - feel free to use, modify, and distribute.

---

## 🐠 About

Created to help aquarium hobbyists maintain healthy water conditions using AI-powered image analysis.

**Not affiliated with Tetra or any aquarium product manufacturer.**

Always verify critical readings with liquid test kits before making major tank adjustments.

---

## 💡 Troubleshooting

### "Failed to fetch" error
- Make sure `ANTHROPIC_API_KEY` is set in Vercel environment variables
- Redeploy after adding the environment variable

### Local development issues
- Make sure you copied `.env.example` to `.env`
- Add your API key to `.env`
- Restart the dev server after changing `.env`

### API key not working
- Get a fresh key from https://console.anthropic.com
- Make sure it starts with `sk-ant-api03-`
- Check you have free credits remaining
