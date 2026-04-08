# 🌾 AgriSmart — AI-Powered Agriculture Platform

A full-stack agriculture platform built with React + Node.js featuring AI disease detection, weather intelligence, soil analysis, fertilizer advisor, farmer community and real-time market prices.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

The `.env` file is already set up in the `server/` folder with your keys.

For client, create `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run Locally

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open: http://localhost:5173

---

## 🔐 Login Credentials

**Farmer:** Sign up with phone number + password  
**Admin:** username: `admin` | password: `admin123`

---

## 📦 Deploy to Production

### Backend → Render

1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect your GitHub repo
4. Set root directory: `server`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add all environment variables from `server/.env`
8. Deploy!

### Frontend → Vercel

1. Go to vercel.com → New Project
2. Connect your GitHub repo
3. Set root directory: `client`
4. Framework: Vite
5. Add environment variable:
   - `VITE_API_URL` = your Render backend URL + `/api`
   - `VITE_SOCKET_URL` = your Render backend URL
6. Deploy!

### Update CORS after deploy

In `server/.env`, change:
```
CLIENT_URL=https://your-vercel-app.vercel.app
```

---

## 🌟 Features

- 🌦 **Weather Intelligence** — Live weather, rain/drought alerts, AI farming advice
- 🌱 **Soil Analysis** — AI soil composition analysis, crop recommendations
- 🔬 **Disease Detection** — Upload crop photo, AI identifies disease + treatment
- 💊 **Fertilizer Advisor** — Camera scan fertilizer, get dosage recommendation  
- 👥 **Farmer Community** — Posts, comments, likes, categories
- 📊 **Market Insights** — Real-time mandi prices, compare markets, best sell time
- 🌐 **5 Languages** — English, Hindi, Marathi, Kannada, Tamil
- 🔐 **Dual Auth** — Farmer login (phone) + Admin login
- 📡 **Real-time** — Socket.io for live market price updates

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| 3D | Three.js, React Three Fiber |
| Animations | Framer Motion |
| i18n | i18next |
| State | Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT, bcrypt |
| Images | Cloudinary |
| AI | Google Gemini |
| Weather | OpenWeatherMap |
| Real-time | Socket.io |
| Deploy | Vercel + Render |
