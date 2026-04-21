# HostelMate

HostelMate is a full-stack hostel management application for students and administrators. It combines mobile-first workflows (Expo React Native) with a modular Node.js backend and Firebase.

## Highlights

- Role-based app flow for students and admins
- Firebase Authentication for login/signup and session handling
- Firestore-backed hostel modules:
   - Complaints
   - Expenses
   - In/Out logs
   - Announcements
- Admin views for student and profile management
- AI chatbot endpoint with request rate limiting and grounded context
- Optional SMTP email notifications for module updates

## Tech Stack

- Frontend: Expo + React Native (JavaScript)
- Backend: Node.js + Express
- Database: Firebase Firestore
- Auth: Firebase Authentication
- AI: Gemini API (backend service)

## Repository Structure

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

## Prerequisites

- Node.js 18+
- npm 9+
- Firebase project with:
   - Firestore enabled
   - Authentication enabled
- Expo Go app or emulator/simulator for mobile testing

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/AdityaSir1512/HostelMate.git
cd HostelMate

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure backend environment

Create backend/.env from backend/.env.example and fill your own values.

Required backend variables:

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

Note: Instead of FIREBASE_SERVICE_ACCOUNT_KEY, you can use GOOGLE_APPLICATION_CREDENTIALS in your shell environment.

### 3. Configure frontend Firebase client

Set Firebase web app credentials in frontend/services/firebase.js (or wire these into Expo public env vars if you prefer).

### 4. Run backend

```bash
cd backend
npm run dev
```

Backend runs on http://localhost:5001 by default.

### 5. Run frontend

```bash
cd frontend
npm start
```

Then choose platform:

- a for Android emulator
- i for iOS simulator
- w for web

## Scripts

### Backend

```bash
npm start          # start server
npm run dev        # start with nodemon
npm run create:admin
```

### Frontend

```bash
npm start
npm run android
npm run ios
npm run web
```

## API Modules

The backend exposes route groups under:

- /complaints
- /expenses
- /logs
- /announcements
- /chat

See backend/routes for endpoint definitions.

## Platform Notes

- Android emulator commonly uses http://10.0.2.2:5001 for local backend.
- iOS simulator/web commonly use http://127.0.0.1:5001.
- Physical devices should point to your machine LAN IP via frontend/services/api.js or Expo public env configuration.

## Security Notes

- Never commit secrets, service-account JSON, API keys, or passwords.
- Env files are gitignored in this repository.
- If any credential was ever exposed publicly, rotate it immediately in the provider console.

## Roadmap Ideas

- Add automated tests for controllers and services
- Add CI pipeline (lint + test + build checks)
- Add role-based backend authorization middleware
- Add API docs (OpenAPI/Swagger)

## License

ISC
