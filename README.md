# 📞 Call Me Reminder

A beautiful, full-stack reminder application that calls you with voice messages using Vapi AI. Never forget anything again with automated phone call reminders!

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.13-yellow?style=flat-square&logo=python)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

### Reminder Management
- **Create reminders** with title, message, phone number, date/time, and timezone
- **Dashboard view** with upcoming reminders sorted by time
- **Status tracking**: Scheduled, Completed, Failed
- **Edit & Delete** reminders easily
- **Search & Filter** by status or keywords
- **Countdown timer** showing time remaining

### Voice Call Integration
- **Automated calls** using Vapi AI at scheduled time
- **Natural voice** speaks your reminder message
- **Retry logic** for failed calls (up to 3 attempts)
- **Call status tracking** with detailed error messages

### Premium UI/UX
- **Modern design** with consistent spacing and typography
- **Responsive layout** for mobile and desktop
- **Beautiful animations** with Framer Motion
- **Loading skeletons** for smooth perceived performance
- **Empty states** that guide users
- **Toast notifications** for feedback
- **Form validation** with inline error messages

## 🏗️ Architecture

```
fullstack-app/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── main.py         # Application entry point
│   │   ├── config.py       # Configuration management
│   │   ├── database.py     # SQLAlchemy setup
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── routers/        # API routes
│   │   │   └── reminders.py
│   │   └── services/       # Business logic
│   │       ├── reminder_service.py
│   │       ├── vapi_service.py
│   │       └── scheduler.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   │   ├── ui/        # Reusable UI primitives
│   │   │   ├── layout/    # Layout components
│   │   │   └── reminders/ # Reminder-specific components
│   │   ├── lib/           # Utilities and API client
│   │   └── types/         # TypeScript types
│   ├── package.json
│   └── Dockerfile
│
└── docker-compose.yml     # Docker orchestration
```

## 🔧 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui-inspired components** (custom-built)
- **React Query** for server state management
- **React Hook Form** + **Zod** for form handling
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **FastAPI** for high-performance API
- **SQLAlchemy 2.0** for ORM
- **SQLite** for database (easily swappable)
- **APScheduler** for background job scheduling
- **Pydantic** for data validation
- **httpx** for async HTTP requests

### Integrations
- **Vapi AI** for voice calls
- **Twilio** for phone numbers

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Vapi Account** ([Sign up free](https://vapi.ai))
- **Twilio Account** ([Sign up for trial](https://twilio.com))

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd fullstack-app
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your credentials (see Environment Variables section)
```

### 3. Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# The default API URL should work: http://localhost:8000/api
```

### 4. Configure Environment Variables

#### Backend (.env)

```env
# Database
DATABASE_URL=sqlite:///./reminders.db

# Vapi Configuration (Required)
VAPI_API_KEY=your_vapi_api_key_here
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id_here

# Twilio Configuration (Optional - for Vapi)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Application
APP_ENV=development
DEBUG=true
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 5. Get Your API Keys

#### Vapi Setup:
1. Sign up at [vapi.ai](https://vapi.ai)
2. Go to **Dashboard** → **API Keys**
3. Copy your API key → `VAPI_API_KEY`
4. Go to **Phone Numbers** → Import your Twilio number
5. Copy the Phone Number ID → `VAPI_PHONE_NUMBER_ID`

#### Twilio Setup (for Vapi phone number):
1. Sign up at [twilio.com](https://twilio.com)
2. Go to **Console Dashboard**
3. Copy Account SID → `TWILIO_ACCOUNT_SID`
4. Copy Auth Token → `TWILIO_AUTH_TOKEN`
5. Get a phone number from **Phone Numbers** → `TWILIO_PHONE_NUMBER`
6. Import this number into Vapi

### 6. Run the Application

**Option A: Run Separately (Recommended for Development)**

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option B: Run with Docker**

```bash
# From root directory
docker-compose up --build
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🧪 Testing the Call Workflow

### Quick Test (2-3 minutes):

1. Open the app at http://localhost:3000
2. Click **"New Reminder"**
3. Fill in:
   - **Title**: "Test Reminder"
   - **Message**: "This is a test reminder. Everything is working!"
   - **Phone Number**: Your phone number in E.164 format (e.g., +14155552671)
   - **Date & Time**: 2-3 minutes from now
   - **Timezone**: Select your timezone
4. Click **"Create Reminder"**
5. Watch the dashboard - the countdown will tick down
6. When the time comes, you should receive a phone call
7. The status will change to **"Completed"** or **"Failed"**

### Verify Backend Scheduler:

Check the backend logs to see scheduler activity:
```bash
# You should see logs like:
# INFO: Reminder scheduler started
# INFO: Found 1 due reminders
# INFO: Processing reminder 1: Test Reminder
# INFO: Call initiated for reminder 1: call_xxx
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders` | List reminders (with filtering) |
| POST | `/api/reminders` | Create a reminder |
| GET | `/api/reminders/{id}` | Get a reminder |
| PUT | `/api/reminders/{id}` | Update a reminder |
| DELETE | `/api/reminders/{id}` | Delete a reminder |
| GET | `/api/reminders/timezones` | Get available timezones |
| GET | `/health` | Health check |

### Query Parameters for List:
- `status`: Filter by status (scheduled, completed, failed)
- `search`: Search in title/message
- `sort_by`: Field to sort by (default: scheduled_at)
- `sort_order`: asc or desc
- `page`: Page number
- `page_size`: Items per page

## ⏰ How Scheduling Works

The backend uses **APScheduler** to check for due reminders every 30 seconds:

1. **Scheduler starts** when the backend boots up
2. Every 30 seconds, it queries for reminders where:
   - `status = 'scheduled'`
   - `scheduled_at <= now`
3. For each due reminder:
   - Triggers a call via Vapi API
   - Updates status to `completed` on success
   - Retries up to 3 times on failure
   - Marks as `failed` after max retries

### Why 30 seconds?

- Balances responsiveness with efficiency
- Minimal delay (max 30s) for user experience
- Reduces database queries compared to polling more frequently

## 🎨 Design Decisions

### Frontend

1. **Custom UI Components**: Built shadcn/ui-inspired components for full control and consistency
2. **React Query**: Handles caching, refetching, and loading states elegantly
3. **Form Validation**: Zod + React Hook Form for type-safe, user-friendly validation
4. **Framer Motion**: Smooth animations enhance perceived performance
5. **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Backend

1. **SQLite**: Simple to set up, no external dependencies; easily replaceable with PostgreSQL
2. **APScheduler**: Built-in Python scheduler; no external job queue needed for this scale
3. **Async/Await**: FastAPI's async support for non-blocking I/O
4. **Service Layer**: Business logic separated from routes for testability

### Vapi Integration

1. **Assistant Configuration**: Dynamic prompts with reminder title/message
2. **ElevenLabs Voice**: Natural-sounding AI voice (Rachel)
3. **Retry Logic**: Handles transient failures gracefully
4. **Status Tracking**: Full call lifecycle visibility

## 🔒 Security Considerations

- Environment variables for all secrets
- No hardcoded credentials in codebase
- Input validation on both frontend and backend
- Phone number format validation
- CORS configured for allowed origins

## 🐛 Troubleshooting

### Call not triggering?
1. Check backend logs for scheduler activity
2. Verify Vapi credentials are correct
3. Ensure phone number is in E.164 format
4. Check Twilio phone number is imported to Vapi

### API connection issues?
1. Ensure backend is running on port 8000
2. Check CORS settings if seeing errors
3. Verify `NEXT_PUBLIC_API_URL` in frontend

### Database errors?
1. Delete `reminders.db` and restart backend
2. Check write permissions in backend directory

## 📦 Project Structure Details

### Frontend Components

```
components/
├── ui/                    # Reusable primitives
│   ├── button.tsx        # Button with variants & loading
│   ├── input.tsx         # Input with error state
│   ├── textarea.tsx      # Textarea component
│   ├── card.tsx          # Card container
│   ├── badge.tsx         # Status badges
│   ├── dialog.tsx        # Modal dialogs
│   ├── select.tsx        # Select dropdown
│   ├── tabs.tsx          # Tab navigation
│   ├── label.tsx         # Form labels
│   ├── skeleton.tsx      # Loading skeletons
│   └── sonner.tsx        # Toast notifications
├── layout/
│   └── header.tsx        # App header
├── reminders/
│   ├── reminder-card.tsx       # Reminder display card
│   ├── reminder-form-dialog.tsx # Create/Edit form
│   └── empty-state.tsx         # Empty state display
├── dashboard.tsx         # Main dashboard view
└── providers.tsx         # React Query provider
```

### Backend Services

```
services/
├── reminder_service.py   # CRUD operations
├── vapi_service.py       # Vapi API integration
└── scheduler.py          # Background job scheduler
```

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel
```

### Railway/Render (Backend)
- Connect your repository
- Set environment variables
- Deploy with Python 3.11+ buildpack

### Docker (Full Stack)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📄 License

MIT License - feel free to use this project as a template!

---

Built with ❤️ using Next.js, FastAPI, and Vapi AI
