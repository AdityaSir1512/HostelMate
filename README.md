# HostelMate

HostelMate is a full-stack hostel management app with:
- Frontend: Expo React Native (SDK 55, JavaScript)
- Backend: Node.js + Express (JavaScript)
- Database: Firebase Firestore
- Authentication: Firebase Authentication

## Project Structure

- frontend/
  - screens/
  - components/
  - navigation/
  - context/
  - services/
  - utils/
  - constants/
- backend/
  - routes/
  - controllers/
  - models/
  - config/
  - middleware/

## Step-by-Step Build Flow

1. Setup frontend (Expo)
   - Created Expo project and upgraded to SDK 55.
   - Added navigation, Firebase, SecureStore, AsyncStorage, axios, and UI dependencies.

2. Setup backend (Node.js + Express)
   - Created Express app with modular route/controller/model architecture.
   - Added Firebase Admin SDK integration with Firestore.

3. Implement authentication
   - Frontend uses Firebase Authentication for signup/login.
   - Session token stored in Expo SecureStore.
   - User snapshot stored in AsyncStorage.

4. Build feature modules
   - Complaint, Expense, In/Out logs with form validation and list views.
   - Mess Menu screen from Firestore collection (with fallback sample data).
   - Profile screen with secure logout.

5. Integrate chatbot
   - Added chatbot screen with GenAI backend integration.
   - Added short conversation memory for multi-turn chat.
   - Added backend grounding with recent complaints, expenses, and in/out logs.
   - Added backend rate limiting for chat endpoint protection.
   - Added local rule-based fallback when AI response is unavailable.

6. Connect frontend with backend
   - Axios-based API client for /complaints, /expenses, /logs CRUD endpoints, and POST /chat.

## Setup Instructions

### Backend

1. Go to backend:

```bash
cd backend
```

2. Copy env values from .env.example and set Firebase credentials.

3. Set GenAI environment values in backend .env:

```bash
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

4. Run server:

```bash
npm install
npm run dev
```

Server runs at http://localhost:5001 by default.

### Frontend

1. Go to frontend:

```bash
cd frontend
```

2. Configure Firebase client keys in services/firebase.js.

3. Start Expo:

```bash
npm install
npm start
```

## Notes

- Android emulator uses API base URL http://10.0.2.2:5001.
- iOS simulator and web use http://127.0.0.1:5001.
- Physical devices should use EXPO_PUBLIC_API_URL or the Expo host auto-detection.
- For physical devices, update frontend/services/api.js with your machine IP.
- Password reset is handled by Firebase Authentication from the login screen.
- Complaint, expense, and in/out updates can trigger email notifications when SMTP settings are configured.
