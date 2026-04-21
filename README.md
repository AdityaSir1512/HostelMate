# HostelMate

> Smart hostel operations for students and admins, built mobile-first.

HostelMate is a full-stack app that streamlines day-to-day hostel workflows using an Expo React Native frontend, a modular Express backend, and Firebase services.

## ✦ Why HostelMate?

- ⚡ Fast role-based flow for students and admins
- 🔐 Firebase Authentication for secure signup/login
- 🧾 Core hostel modules powered by Firestore
- 🤖 AI chatbot endpoint with context + rate limiting
- 📣 Announcements and operational records in one place
- 📧 Optional email notifications via SMTP

## ✦ Feature Map

### 👨‍🎓 Student Side

- File and track complaints
- View and manage expenses
- Record in/out logs
- Check announcements and profile
- Use the chatbot assistant

### 🛠️ Admin Side

- Monitor student operations
- Review key records (complaints, expenses, logs)
- Manage profiles and hostel communication

## ✦ Tech Stack

| Layer | Technology |
|---|---|
| 📱 Frontend | Expo + React Native (JavaScript) |
| 🌐 Backend | Node.js + Express |
| 🗃️ Database | Firebase Firestore |
| 🔑 Auth | Firebase Authentication |
| 🧠 AI | Gemini API (backend integration) |

## ✦ Project Structure

```text
HostelMate/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    scripts/
    services/
    index.js
  frontend/
    assets/
    components/
    constants/
    context/
    navigation/
    screens/
    services/
    utils/
    App.js
  README.md
```

## ✦ Prerequisites

- Node.js 18+
- npm 9+
- Firebase project with:
  - Firestore enabled
  - Authentication enabled
- Expo Go or emulator/simulator

## ✦ Quick Start

### 1. Clone + Install

```bash
git clone https://github.com/AdityaSir1512/HostelMate.git
cd HostelMate

cd backend && npm install
cd ../frontend && npm install
```

### 2. Backend Environment Setup

Create backend/.env from backend/.env.example and fill values with your own credentials.

```env
PORT=5001
FIREBASE_SERVICE_ACCOUNT_KEY={...}
ALLOW_IN_MEMORY_FALLBACK=false
ADMIN_EMAIL=admin@hostelmate.com
ADMIN_PASSWORD=change-this-password
ADMIN_NAME=Hostel Admin
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
CHAT_RATE_LIMIT_WINDOW_MS=60000
CHAT_RATE_LIMIT_MAX_REQUESTS=20
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=no-reply@example.com
```

Alternative: use GOOGLE_APPLICATION_CREDENTIALS in your shell instead of FIREBASE_SERVICE_ACCOUNT_KEY.

### 3. Frontend Firebase Setup

Set Firebase web app credentials in frontend/services/firebase.js (or migrate to Expo public env vars).

### 4. Start Backend

```bash
cd backend
npm run dev
```

Backend URL: http://localhost:5001

### 5. Start Frontend

```bash
cd frontend
npm start
```

Expo shortcuts:

- a → Android emulator
- i → iOS simulator
- w → Web

## ✦ Scripts

### Backend

```bash
npm start          # start server
npm run dev        # nodemon mode
npm run create:admin
```

### Frontend

```bash
npm start
npm run android
npm run ios
npm run web
```

## ✦ API Route Groups

Backend routes are organized under:

- /complaints
- /expenses
- /logs
- /announcements
- /chat

Check backend/routes for detailed endpoint files.

## ✦ Platform Networking Notes

- Android emulator: http://10.0.2.2:5001
- iOS simulator/web: http://127.0.0.1:5001
- Physical device: use your machine LAN IP in frontend/services/api.js or Expo env setup

## ✦ Security First

- 🚫 Never commit secrets (API keys, private keys, passwords)
- ✅ Env files are gitignored in this repository
- 🔄 Rotate any credential immediately if exposed

## ✦ Future Enhancements

- Add automated tests for controllers/services
- Add CI checks (lint/test/build)
- Add stronger role-based backend authorization
- Add OpenAPI/Swagger docs

## ✦ License

ISC
