# MindWell — AI-Driven Mental Health Platform
## Complete Project Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [How to Run the Project](#4-how-to-run-the-project)
5. [Demo Credentials](#5-demo-credentials)
6. [Frontend — Complete File Guide](#6-frontend--complete-file-guide)
   - [Entry Points](#61-entry-points)
   - [Pages](#62-pages)
   - [Components](#63-components)
   - [Services](#64-services)
7. [Backend — Complete File Guide](#7-backend--complete-file-guide)
   - [Django Apps Overview](#71-django-apps-overview)
   - [App: user](#72-app-user)
   - [App: client](#73-app-client)
   - [App: human_coach](#74-app-human_coach)
   - [App: coach_client](#75-app-coach_client)
   - [App: emotion_data](#76-app-emotion_data)
   - [App: session_log](#77-app-session_log)
   - [App: ai_guidance](#78-app-ai_guidance)
   - [App: notification](#79-app-notification)
   - [App: coach_feedback](#710-app-coach_feedback)
   - [App: upload_resource](#711-app-upload_resource)
8. [Database Models — All Tables](#8-database-models--all-tables)
9. [API Endpoints](#9-api-endpoints)
10. [Key Features Explained](#10-key-features-explained)
11. [User Roles & Permissions](#11-user-roles--permissions)
12. [Data Flow — How the System Works](#12-data-flow--how-the-system-works)
13. [localStorage — Client-Side Persistence](#13-localstorage--client-side-persistence)
14. [AI & Machine Learning Pipeline](#14-ai--machine-learning-pipeline)
15. [Risk Assessment System](#15-risk-assessment-system)
16. [Appointment & Notification System](#16-appointment--notification-system)

---

## 1. Project Overview

**MindWell** is a full-stack AI-powered mental health support platform built as a Final Year Project (FYP). It bridges the gap between self-guided mental wellness tracking and access to licensed professional mental health coaches.

### What the platform does:

- Users log their **emotions and moods** in daily sessions.
- An **AI system** (custom-trained transformer model + Ollama LLM) analyzes those emotions in real time.
- The AI generates personalized **therapeutic responses and guidance**.
- A **risk scoring engine** continuously evaluates how distressed a user is (0–100%).
- When risk crosses a threshold (≥30%), a **"Professional Support Recommended"** banner appears on the dashboard.
- Users can **book appointments** with licensed human coaches directly through the platform.
- Coaches see all **pending appointment requests**, can **accept** or **decline** (with a suggested alternative time).
- Clients receive **real-time notifications** about their booking status.
- Coaches can view their clients' emotional data, session logs, and risk indicators via the coach dashboard.

### Who uses it:

| Role | What they do |
|---|---|
| **Client (Patient)** | Logs emotions, chats with AI, books coach appointments, reads wellness notifications |
| **Human Coach** | Reviews pending appointments, accepts/declines bookings, monitors client risk levels, messages clients |
| **Admin / Superuser** | Approves coach license applications before they can practice on the platform |

---

## 2. Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.0 | UI framework |
| **TypeScript** | 5.9.3 | Type-safe JavaScript |
| **Vite** | 7.2.4 | Build tool and dev server |
| **React Router DOM** | 7.11.0 | Client-side routing |
| **Framer Motion** | 12.23.26 | Animations (modals, transitions, page reveals) |
| **Axios** | 1.13.2 | HTTP client for backend API calls |
| **Recharts** | 3.6.0 | Charts and data visualisation (mood trends, analytics) |
| **Lucide React** | 0.562.0 | Icon library |
| **tsParticles** | 3.9.1 | Animated particle background on the landing/auth page |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Django** | 6.x | Python web framework |
| **Django REST Framework (DRF)** | 3.16.1 | RESTful API layer |
| **SQLite** | — | Database (file: `db.sqlite3`) |
| **Ollama** | — | Local LLM for AI-generated therapeutic responses |
| **PyTorch / Transformers** | — | Custom fine-tuned BERT emotion classifier |
| **NumPy** | 2.4.2 | Numerical computations for risk scoring |
| **HTTPX** | 0.28.1 | Async HTTP client (used when calling Ollama API) |

### No Tailwind CSS — all styling is done with:
- **Inline styles** (`style={{ ... }}`) for component-level styling
- **CSS Modules** (`.css` files per page) for global and layout styles

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER (Client)                  │
│                                                     │
│  React 19 + TypeScript + Vite (port 5173)           │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Pages   │  │Components│  │  Services (axios)  │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
│         │              │              │              │
│         └──────────────┴──────────────┘              │
│                        │                             │
│         localStorage (appointments, user, notifs)   │
└────────────────────────┼─────────────────────────────┘
                         │ HTTP / REST API
                         ▼
┌─────────────────────────────────────────────────────┐
│             Django REST Framework (port 8000)        │
│                                                     │
│  ┌────────┐ ┌────────┐ ┌─────────┐ ┌─────────────┐ │
│  │  user  │ │ client │ │ session │ │  ai_guidance│ │
│  └────────┘ └────────┘ └─────────┘ └─────────────┘ │
│  ┌──────────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ human_coach  │ │ emotion  │ │  notification    │ │
│  └──────────────┘ └──────────┘ └──────────────────┘ │
│                        │                             │
│                   SQLite DB (db.sqlite3)              │
│                        │                             │
│               ┌────────┴──────────┐                 │
│               │    AI Pipeline    │                 │
│               │  BERT Classifier  │                 │
│               │  + Ollama LLM     │                 │
│               └───────────────────┘                 │
└─────────────────────────────────────────────────────┘
```

**Key design decision:** Because this is a demonstration/FYP project, all appointment bookings and coach notifications are saved to **browser localStorage** regardless of whether the backend API succeeds. This ensures the demo always works even if the backend is unavailable or the client ID mapping fails.

---

## 4. How to Run the Project

### Backend

```bash
cd backend/FYP_Backend-main
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver   # Starts at http://127.0.0.1:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                  # Starts at http://localhost:5173
```

### Both must run simultaneously. Open http://localhost:5173 in the browser.

---

## 5. Demo Credentials

These accounts are pre-created in the system for demonstration purposes.

### Client Accounts (high-risk users who trigger the professional support banner)

| Name | Email | Password | Risk Level |
|---|---|---|---|
| Nadia Shah | nadia.shah@demo.com | demo1234 | Critical (89%) |
| Bilal Ahmed | bilal.ahmed@demo.com | demo1234 | High (71%) |

### Coach Accounts

| Name | Email | Password | Specialization |
|---|---|---|---|
| Dr. Sara Khan | sara.khan@demo.com | coach1234 | Anxiety & Depression Specialist |
| Dr. Hassan Mirza | hassan.mirza@demo.com | coach1234 | Cognitive Behavioural Therapy (CBT) |
| Dr. Amna Rauf | amna.rauf@demo.com | coach1234 | Stress Management & Work Burnout |
| Dr. Zain Ali | zain.ali@demo.com | coach1234 | Trauma & PTSD Recovery |

---

## 6. Frontend — Complete File Guide

### 6.1 Entry Points

#### `src/main.tsx`
The application entry point. Mounts the React app into the `#root` div in `index.html`. Wraps the app in React's `StrictMode` for development warnings.

#### `src/App.tsx`
The **routing hub** of the entire application. Uses React Router DOM to define all URL paths.

**Routes defined:**
| Path | Component | Who sees it |
|---|---|---|
| `/` | `Auth` | Everyone (login/signup) |
| `/dashboard` | `DashboardLayout` (shell) | Authenticated users |
| `/dashboard/` (index) | `Overview` | All dashboard users |
| `/dashboard/mood-tracker` | `MoodTracker` | Clients |
| `/dashboard/ai-assistant` | `AIGuidance` | Clients |
| `/dashboard/session/:sessionId` | `SessionDetail` | Clients |
| `/dashboard/notifications` | `Notifications` | All users |
| `/dashboard/settings` | `Settings` | All users |
| `/dashboard/select-coach` | `SelectCoach` | Clients |
| `/dashboard/patients` | `Patients` | Coaches |
| `/dashboard/coach-overview` | `CoachDashboard` | Coaches |
| `/dashboard/session-logs` | `SessionLogs` | Coaches |
| `/dashboard/coach-approval` | `CoachApproval` | Admins |

Unknown paths redirect to `/` (login).

#### `src/index.css`
Global CSS reset and base font styles applied to the entire app.

#### `src/App.css`
Additional global styles for the app shell.

---

### 6.2 Pages

#### `src/pages/Auth.tsx` + `Auth.css`
**The Login and Sign-Up page.** First screen users see.

**What it does:**
- Renders a split screen: animated particle background on the left, form on the right.
- Toggles between **Login** and **Sign Up** mode.
- Sign Up collects: name, email, password, role (client/coach), and if coach: license ID and specialization.
- On login: calls `POST /user/user/login/` → stores the response (user object with id, name, email, role) in `localStorage` as `"user"`.
- On successful login, reads the role and redirects:
  - `client` → `/dashboard` (Overview)
  - `coach` → `/dashboard/coach-overview` (CoachDashboard)
  - `admin` → `/dashboard/coach-approval`

**Key state:** `isLogin` (toggle), `formData` (all fields), `loading`, `error`.

---

#### `src/pages/Dashboard.tsx` + `Dashboard.css`
**The sidebar layout shell** that wraps all dashboard pages.

**What it does:**
- Reads the logged-in user from localStorage.
- Renders a collapsible **left sidebar** with navigation links appropriate to the user's role.
- Uses `<Outlet />` (React Router) so child routes render in the main content area.
- Wraps every child route in `ProtectedDashboardWrapper` (the high-risk banner component).
- Shows a top bar with the user's name and a notification bell.
- The sidebar shows different links for clients vs coaches vs admins.

**Client sidebar links:** Overview, Mood Tracker, AI Assistant, Notifications, Settings, Select Coach

**Coach sidebar links:** Dashboard, My Clients, Session Logs, Notifications

**Admin sidebar links:** Coach Approval, Overview

---

#### `src/pages/Overview.tsx` + `Overview.css`
**The main dashboard homepage** shown immediately after login.

**What it does:**
- Displays a greeting (Good Morning / Afternoon / Evening) with the user's name.
- Shows **summary stat cards**: streak days, mood score, sessions completed, wellness score.
- Shows a **"Book Coach Appointment"** button which opens the `CoachAppointmentModal`.
- Displays a **mood trend chart** (Recharts) showing emotion intensity over the last 7 sessions.
- Shows **quick action tiles** linking to other pages (Mood Tracker, AI Assistant, Journal, etc.).
- Fetches session data from the backend to populate the chart; falls back to sample data if the API fails.

---

#### `src/pages/MoodTracker.tsx` + `MoodTracker.css`
**Where clients log their current emotion.**

**What it does:**
- Presents a grid of emotion tiles: Happy, Sad, Anxious, Angry, Fearful, Surprised, Disgusted, Neutral.
- User picks an emotion and drags a slider (1–10) for intensity.
- Optionally writes a note about how they are feeling.
- On submit: calls `POST /emotion_data/emotions/` to save to the backend.
- Also calls the session log API to associate the emotion with the active session.
- After submission, shows a success animation and redirects the user to the AI Assistant to continue their session.

---

#### `src/pages/AIGuidance.tsx` + `AIGuidance.css`
**The AI therapy chatbot interface.** The core feature of the platform.

**What it does:**
- Renders a chat window that looks and feels like a messaging app.
- The user types messages expressing their feelings.
- Messages are sent to `POST /ai_guidance/ai-guidance/` which:
  1. Classifies the emotion in the message using the fine-tuned BERT model.
  2. Generates a therapeutic response using the Ollama LLM (local AI).
  3. Returns the AI's response text.
- Displays both user messages and AI responses in the chat bubbles.
- Shows the detected emotion and confidence score for each user message.
- Includes a "Start New Session" button.
- At the end of a session, the conversation is summarized and stored.
- Tracks risk keywords in real time; if crisis language is detected, escalates to a high-risk alert.

---

#### `src/pages/Notifications.tsx` + `Notifications.css`
**The notifications inbox** for all users.

**What it does:**
- Reads the user role from localStorage.
- For **coaches**: displays mock coach notifications (client alerts, high-risk flags, session summaries).
- For **clients**: 
  - Fetches notifications from `GET /api/notifications/?client_id=X`.
  - Falls back to hardcoded sample notifications if the API is unavailable.
  - **Additionally reads `mindwell_notifications` from localStorage** — this is where real appointment accept/decline updates from the coach appear.
- Shows an **"Appointment Updates"** section at the top for real appointment status:
  - ✅ **Accepted**: "Dr. Sara Khan accepted your session on Mon, Jun 29 at 10:00."
  - ❌ **Declined**: Shows coach's note + a yellow box with the **suggested alternative time** and a **"Book Suggested Time"** button.
- Clicking "Book Suggested Time" saves a new pending appointment to localStorage and shows a confirmation inline — no extra modal needed.
- Supports: mark as read (click notification), delete (✕ button), filter (All / Unread), mark all as read.

---

#### `src/pages/CoachDashboard.tsx` + `CoachDashboard.css`
**The coach's main workspace.** Only visible to users with `role = "coach"`.

**What it does:**
- Shows 4 stat cards: Total Clients, Active Sessions, Pending Reviews, Weekly Growth.
- **Pending Appointment Requests section**: reads `mindwell_appointments` from localStorage and shows all bookings with status `"pending"`.
  - Each pending card shows: client name (with initials avatar), booked date, booked time, coach name.
  - **Accept button** (green): marks appointment as `"accepted"`, creates a client notification in `mindwell_notifications`.
  - **Decline button** (red): opens the **Decline & Suggest Time modal**.
- **Decline modal** collects:
  - Coach's available date (calendar picker, pre-set to 2 days from now).
  - Available time slot (grid of 8 time buttons).
  - Optional note to the client.
  - On confirm: saves `status: "declined"` to localStorage and writes a notification with the suggested time.
- Shows Recent Activity feed (static demo data).
- Shows Quick Actions: Schedule Session, View Clients, View Session Logs, Notifications.
- Shows Today's Schedule (demo data).
- Has a **Schedule Session modal** for coaches to proactively book sessions with clients.

---

#### `src/pages/Patients.tsx` + `Patients.css`
**The coach's client management page.** Lists all clients assigned to this coach.

**What it does:**
- Fetches client list from `GET /coach_client/coach-clients/`.
- Displays each client in a card: name, email, risk level badge, last session date.
- Each client card has two action buttons:
  - **View Records** → opens a modal showing the client's full emotion history and session summaries.
  - **Send Message** → opens a message modal to compose a text message to the client.
- Supports search by name or email.
- Risk levels are colour-coded: Critical (red), High (orange), Moderate (yellow), Low (green).
- Both modals have visible close buttons with proper styling.

---

#### `src/pages/SessionLogs.tsx` + `SessionLogs.css`
**A detailed log of all therapy sessions** (coach view).

**What it does:**
- Fetches all session logs from the backend.
- Displays sessions in a sortable table: date, client name, emotion detected, intensity, risk level, coach notified flag.
- Clicking a session row expands it to show: AI-generated session summary, full emotion breakdown, referral status.
- Sessions with `needs_human_coach: true` are highlighted in orange.

---

#### `src/pages/SessionDetail.tsx` + `SessionDetail.css`
**Single session deep-dive page.**

**What it does:**
- Accessed via `/dashboard/session/:sessionId`.
- Fetches a specific session's data including all chat messages and emotion records.
- Shows the full conversation transcript between the user and the AI.
- Displays emotion analysis for each message: primary emotion, confidence, intensity.
- Shows the AI-generated session summary at the top.
- Shows the final risk assessment for that session.

---

#### `src/pages/SelectCoach.tsx` + `SelectCoach.css`
**Where clients browse and pick their assigned coach.**

**What it does:**
- Fetches the list of all approved coaches from `GET /api/ai-guidance/available-coaches/`.
- Displays coach profile cards: full name, specialization, license badge, verified checkmark.
- Client can select a coach and confirm — calls `POST /api/ai-guidance/assign-coach/`.
- Once assigned, the coach appears in the client's dashboard.

---

#### `src/pages/CoachApproval.tsx` + `CoachApproval.css`
**Admin-only page for approving coach license applications.**

**What it does:**
- Fetches all unapproved coach registrations.
- Shows each pending coach: name, email, specialization, license ID, registration date.
- Admin can click **Approve** or **Reject**.
- Approved coaches gain access to the coaching features.
- Rejected applicants are notified.

---

#### `src/pages/Settings.tsx` + `Settings.css`
**User account settings page.**

**What it does:**
- Shows the current user's profile: name, email, role.
- Allows updating display name and notification preferences.
- Shows a **Logout** button that calls `authService.logout()` — clears only the `"user"` key from localStorage (preserving appointment data).

---

#### `src/pages/Journal.tsx` + `Journal.css`
**Personal reflective journal** for clients.

**What it does:**
- Lets users write free-form journal entries.
- Entries are stored and timestamped.
- The AI uses recent journal entries as additional context when doing the `FinalAssessment` (Ollama-powered analysis combining last 10 emotions + journal text).
- Displays past entries in a timeline.

---

### 6.3 Components

#### `src/components/ProtectedDashboardWrapper.tsx`
**The most important wrapper component in the entire app.** It wraps every dashboard page and handles the professional support banner.

**What it does:**
1. On mount, reads the logged-in user from localStorage.
2. If the user is a **client**, calls `GET /api/ai-guidance/check-lock/?client_id=X` to get their current risk score and lock status.
3. If the API call fails or returns a suspiciously low score (< 30), it falls back to a **demo risk score of 78%** so the banner always shows for demo purposes.
4. Evaluates: `shouldShowNotification = (risk_score >= 30 OR is_locked) AND clientId exists`.
5. If true: renders a fixed **yellow/amber banner** at the top of the screen:
   - Heart icon + "Professional Support Recommended" heading.
   - Risk percentage badge (e.g. "Risk: 78%").
   - **Book Appointment button** → opens `ProfessionalCoachBooking` modal.
   - **Dismiss button** → hides the banner for this session (saved in `sessionStorage`).
6. Renders all `{children}` (the actual page content) below the banner.
7. When the booking modal is open, hides the banner to avoid overlap.

---

#### `src/components/ProfessionalCoachBooking.tsx`
**The full-featured appointment booking modal** triggered from the risk banner.

**What it does:**
- Shows the 4 demo coaches (Dr. Sara Khan, Dr. Hassan Mirza, Dr. Amna Rauf, Dr. Zain Ali) — loaded from a hardcoded `MOCK_COACHES` array, no API call.
- Left column: Coach selection cards with avatar (initials + gradient), name, specialization badge, verified checkmark, license ID.
- Right column: Date picker (min: tomorrow), time slot grid (09:00–17:00), session info, submit button.
- If `riskScore >= 60`, shows a risk warning banner inside the modal header.
- On submit:
  1. Silently tries `POST /api/ai-guidance/assign-coach/` (backend assignment).
  2. Silently tries `POST /coach_client/appointments/` (backend booking).
  3. **Always** calls `saveAppointmentLocally()` regardless of API success — this is what makes the coach dashboard work.
  4. Shows a success screen with a green checkmark.
  5. Calls `onAppointmentBooked()` and `onClose()` after 2 seconds.
- Close button: visible with `#F3F4F6` background and dark icon.

---

#### `src/components/CoachAppointmentModal.tsx`
**A simpler appointment booking modal** triggered from the Overview page's "Book Coach Appointment" button.

**What it does:**
- Same 4 demo coaches from `MOCK_COACHES`.
- Two-column layout: coach list on the left, date/time picker on the right.
- Saves appointment to `mindwell_appointments` in localStorage via `saveAppointmentLocally()`.
- Always shows success — API errors are swallowed silently.
- Does NOT manipulate `document.body.style.overflow` (this was the original scroll-lock bug, now fixed).
- Animated with Framer Motion `AnimatePresence`.
- Backdrop click closes the modal.

---

#### `src/components/MandatoryCoachAppointmentModal.tsx`
An earlier version of the mandatory coach booking modal. Kept for reference but superseded by `ProfessionalCoachBooking.tsx`.

---

#### `src/components/MandatoryCoachHireModal.tsx`
An even earlier version of the coach hire flow. Shows the coach selection UI in a different layout. Kept for historical reference.

---

#### `src/components/HighRiskNotification.tsx`
A standalone banner/card component that renders when a client's risk level is detected as high. Wraps a message with appropriate severity styling and an action button.

---

### 6.4 Services

#### `src/services/authService.ts`
Handles all authentication logic.

**Functions:**
- `signupUser(name, email, password, role, licenseId?, specialization?)` — calls `POST /user/user/` to register a new account.
- `loginUser(email, password)` — calls `POST /user/user/login/`, stores the response in `localStorage["user"]`.
- `getCurrentUser()` — reads and parses `localStorage["user"]`. Returns `null` if not logged in or if data is corrupted.
- `logout()` — calls `localStorage.removeItem("user")` (**not** `localStorage.clear()` — this preserves appointment data), then redirects to `/`.

---

#### `src/services/api.ts`
The central Axios API client. All backend calls go through this service.

**Base URL:** `http://127.0.0.1:8000`

**Available API calls:**

| Function | Method | Endpoint | Purpose |
|---|---|---|---|
| `registerUser(data)` | POST | `/user/user/` | Create new user account |
| `createClientProfile(data)` | POST | `/client/clients/` | Create client profile after signup |
| `getClients()` | GET | `/client/clients/` | Fetch all clients (coach use) |
| `getCoachClients()` | GET | `/coach_client/coach-clients/` | Get coach's assigned clients |
| `getAIGuidance()` | GET | `/ai_guidance/ai-guidance/` | Fetch AI guidance records |
| `sendAIGuidance(data)` | POST | `/ai_guidance/ai-guidance/` | Send message, get AI response |
| `checkMandatoryLock(clientId)` | GET | `/api/ai-guidance/check-lock/?client_id=X` | Check client's risk/lock status |
| `assignCoachToClient(clientId, coachId)` | POST | `/api/ai-guidance/assign-coach/` | Assign a coach to a client |
| `getAvailableCoaches()` | GET | `/api/ai-guidance/available-coaches/` | List all approved coaches |
| `bookAppointment(data)` | POST | `/coach_client/appointments/` | Create a backend appointment record |

---

## 7. Backend — Complete File Guide

### 7.1 Django Apps Overview

The backend is a Django project named `myproject`. It contains **10 Django apps**, each responsible for one domain of the system.

```
backend/FYP_Backend-main/
├── myproject/           ← Django project config (settings, root URLs)
├── user/                ← User accounts (login, signup, roles)
├── client/              ← Client profiles
├── human_coach/         ← Coach profiles, approval, chat sessions
├── coach_client/        ← Coach-client assignments and appointments
├── emotion_data/        ← Emotion logs and AI final assessments
├── session_log/         ← Therapy session records
├── ai_guidance/         ← AI chatbot, BERT classifier, risk engine
├── notification/        ← Push notifications for clients
├── coach_feedback/      ← Coach reviews from clients
└── upload_resource/     ← File/resource uploads (PDFs, guides)
```

### 7.2 App: `user`

**Purpose:** Manages all user accounts (clients, coaches, admins).

**Files:**

- `models.py` — Defines the `user` model with fields: `user_id`, `name`, `email`, `password`, `role`, `created_at`.
- `views.py` — CRUD views for the user model. The login endpoint checks email + password and returns the user object.
- `serializers.py` — Converts user model objects to/from JSON for the API.
- `urls.py` — URL patterns: `GET/POST /user/user/` and `POST /user/user/login/`.
- `admin.py` — Registers the user model in the Django admin panel.

**Key model fields:**
```
user_id    — Auto-increment primary key
name       — Full name
email      — Unique email (used as login ID)
password   — Stored as plain text (demo — not hashed)
role       — "client", "coach", or "admin"
created_at — Date account was created
```

---

### 7.3 App: `client`

**Purpose:** Stores additional profile information for users who are clients.

**Files:**

- `models.py` — Defines the `client` model. One-to-one relationship with `user`.
- `views.py` — CRUD for client profiles. Supports filtering by `user_id`.
- `serializers.py` — Serializes client data.
- `urls.py` — URL pattern: `GET/POST /client/clients/`.

**Key model fields:**
```
client_id  — Auto-increment primary key
user_id    — FK → user (the login account)
name       — Client's display name
age        — Integer, validated 13–120
gender     — String ("Male", "Female", "Other")
email      — Email address
```

---

### 7.4 App: `human_coach`

**Purpose:** Manages coach profiles and the coach approval workflow. Also stores coach-client chat sessions.

**Files:**

- `models.py` — Defines two models:
  - `human_coach`: Coach profile with name, specialization, license ID, approval status.
  - `ChatSession`: Stores a conversation transcript between a user and an assigned coach, with a real-time risk score.
- `views.py` — Endpoints for coach registration, approval by admin, listing available/approved coaches.
- `serializers.py` — Serializes coach data.
- `urls.py` — URL patterns for coach CRUD and approval actions.
- `admin.py` — Admin interface for managing coaches.

**Key model fields (human_coach):**
```
coach_id       — Auto-increment primary key
user_id        — OneToOne FK → user
full_name      — Coach's full name
specialization — Area of expertise (e.g., "CBT", "Trauma")
license_id     — Professional license number (unique)
is_approved    — Boolean: admin has approved this coach
requested_at   — When the coach applied
approved_at    — When admin approved
```

**Key model fields (ChatSession):**
```
user           — FK → user
assigned_coach — FK → human_coach (nullable)
transcript     — JSONField: [{role: "user", text: "..."}, ...]
risk_score     — Integer 0–10, updated by AI in real time
is_high_risk   — Auto-set True when risk_score >= 7
updated_at     — Last updated timestamp
```

---

### 7.5 App: `coach_client`

**Purpose:** Manages the assignment of coaches to clients and appointment bookings.

**Files:**

- `models.py` — Defines two models:
  - `coach_client`: Records which coach is assigned to which client.
  - `Appointment`: A scheduled session between a coach and client, with status tracking.
- `views.py` — Endpoints for assigning coaches, listing coach's clients, booking appointments.
- `serializers.py` — Serializes both models.
- `urls.py` — URL patterns for coach-client assignments and appointments.

**Key model fields (coach_client):**
```
coach_client_id — Auto-increment primary key
coach_id        — FK → human_coach
client_id       — FK → client
assigned_date   — Date of assignment
status          — "active", "inactive"
```

**Key model fields (Appointment):**
```
appointment_id   — Auto-increment primary key
coach_id         — FK → human_coach
client_id        — FK → client
appointment_date — DateTime of the session
duration_minutes — Default 60
status           — "pending", "confirmed", "cancelled", "completed"
notes            — Optional text notes
created_at       — When the appointment was booked
updated_at       — Last status change
```

---

### 7.6 App: `emotion_data`

**Purpose:** Records every emotion the client logs during a session. Also stores AI-refined assessments.

**Files:**

- `models.py` — Defines two models:
  - `emotion_data`: Raw emotion log (one per logging event).
  - `FinalAssessment`: Ollama-powered analysis combining the last 10 emotions + journal entry.
- `views.py` — Endpoints to create emotion records and fetch emotion history.
- `serializers.py` — Serializes both models.
- `urls.py` — URL patterns for emotion data CRUD.
- `ollama_emotion_analyzer.py` — Sends the last 10 emotions + journal text to the local Ollama LLM and gets back a refined assessment.

**Key model fields (emotion_data):**
```
emotion_id  — Auto-increment primary key
client_id   — FK → client
session_id  — FK → session_log
emotion     — String (e.g., "anxious", "sad", "happy")
intensity   — Integer 1–10
notes       — Optional client note
created_at  — Timestamp
```

**Key model fields (FinalAssessment):**
```
assessment_id     — Auto-increment primary key
client_id         — FK → client
raw_emotion       — Latest emotion label
raw_intensity     — Latest intensity
final_emotion     — Ollama-refined dominant emotion
final_intensity   — Refined intensity 1–10
recommendation    — AI-generated text recommendation
confidence_score  — Float 0.0–1.0 (AI confidence)
emotions_analyzed — JSON string of the 10 emotions used
journal_entry     — The journal text included in analysis
created_at        — Timestamp
```

---

### 7.7 App: `session_log`

**Purpose:** Records each therapy session — a container that groups all the emotions and AI messages from one sitting.

**Files:**

- `models.py` — Defines the `session_log` model.
- `views.py` — Endpoints for creating sessions, fetching history, updating session summaries.
- `serializers.py` — Serializes session data.
- `urls.py` — URL patterns for session CRUD.

**Key model fields:**
```
session_id          — Auto-increment primary key
user_id             — FK → user
client_id           — FK → client
date                — Date of session
notes               — Free-form text notes
summary             — AI-generated session summary (set at end of session)
final_emotion       — Dominant emotion detected during session
emotion_intensity   — Final intensity 1–10
coach_notified      — Boolean: was the coach alerted?
highest_risk_score  — Highest risk score reached during session
needs_human_coach   — Boolean: AI flagged referral needed
referral_triggered  — Boolean: referral was actually sent
risk_level          — "low", "moderate", "high", "critical"
```

---

### 7.8 App: `ai_guidance`

**Purpose:** The brain of the platform. Contains the AI chatbot, emotion classifier, risk assessment engine, and coach assignment logic.

**Files:**

- `models.py` — Defines 4 models:
  - `ai_guidance`: Records each AI guidance interaction (emotion → AI suggestion).
  - `ChatMessage`: Individual messages in a therapy conversation.
  - `MessageEmotion`: Emotion analysis results for each message.
  - `ConversationAnalytics`: Aggregate statistics for a full session.

- `views.py` — Main API endpoints:
  - `POST /ai_guidance/ai-guidance/` — receives user message, classifies emotion, generates AI response.
  - `GET /api/ai-guidance/check-lock/` — returns client's risk score and lock status.
  - `POST /api/ai-guidance/assign-coach/` — assigns a coach to a client.
  - `GET /api/ai-guidance/available-coaches/` — lists approved coaches.

- `transformers_classifier.py` — Loads the fine-tuned BERT model (if available) and classifies text into 28 emotion categories. Falls back to a rule-based classifier if the model file is absent.

- `emotion_response_generator.py` / `emotion_response_generator_v2.py` — Generates therapeutic text responses based on the detected emotion. Uses templated responses or Ollama LLM.

- `ollama_response_generator.py` — Sends the user message + detected emotion to the local Ollama LLM and streams back a therapeutic response.

- `risk_assessment_service.py` — Calculates a risk score (0–100) based on:
  - Emotion type (grief, fear, anger score higher than joy, calm)
  - Intensity (higher intensity = higher risk)
  - Historical pattern (repeated high-intensity sessions escalate the score)
  - Crisis keywords in the text (e.g., "can't go on", "hopeless")

- `sarcasm_detector.py` — A lightweight classifier that checks if the user's message is sarcastic, which affects how the emotion analysis is interpreted.

- `coach_selection_views.py` — Handles the coach assignment and locking logic.

- `serializers.py` — Serializes all 4 AI models.

- `urls.py` — Registers all AI-related URL patterns.

- `scripts/` — Data science scripts (not part of the running app):
  - `combine_all_datasets.py` — Merges multiple emotion datasets into one training set.
  - `finetune_transformer.py` — Fine-tunes a BERT/DistilBERT model on the combined dataset.
  - `ensemble_classifier.py` — Trains an ensemble of classifiers for comparison.
  - `generate_massive_dataset.py` — Synthetic data augmentation for training.

- `tests/` — Test suite for the AI components:
  - `test_accuracy.py` — Measures classifier accuracy on a test split.
  - `test_bert.py` — Tests the BERT model specifically.
  - `test_api_live.py` — Integration tests against the running API.
  - `system_check.py` — Verifies all AI components are loaded correctly.

---

### 7.9 App: `notification`

**Purpose:** Stores notifications for clients generated by the system (emotion alerts, session summaries, AI suggestions, wellness tips).

**Files:**

- `models.py` — Defines the `notification` model.
- `views.py` — CRUD endpoints. Supports `GET /api/notifications/?client_id=X` and `PUT /api/notifications/{id}/` to mark as read.
- `serializers.py` — Serializes notification data.
- `urls.py` — URL patterns.

**Key model fields:**
```
notification_id   — Auto-increment primary key
client_id         — FK → client
emotion_id        — FK → emotion_data (nullable, what triggered this)
notification_type — "emotion_alert", "session_summary", "wellness_tip", "ai_suggestion"
title             — Short heading
message           — Full notification body text
severity          — "low", "moderate", "high", "critical"
is_read           — Boolean (client has read it)
created_at        — Timestamp
updated_at        — Last modified
```

---

### 7.10 App: `coach_feedback`

**Purpose:** Allows clients to rate and review their sessions with a coach.

**Files:**

- `models.py` — Defines a feedback model with rating (1–5 stars) and a text review.
- `views.py` — Endpoints to submit and retrieve feedback.
- `serializers.py` — Serializes feedback.
- `urls.py` — URL patterns.

---

### 7.11 App: `upload_resource`

**Purpose:** Allows coaches or admins to upload resource files (PDF worksheets, audio guides) that clients can access.

**Files:**

- `models.py` — Defines a resource model with file field, title, description, uploader, and upload date.
- `views.py` — Handles file upload and listing.
- `serializers.py` — Serializes resource metadata.
- `urls.py` — URL patterns for upload and retrieval.

---

## 8. Database Models — All Tables

A quick reference for all database tables in the system.

| Table | App | Primary Key | Description |
|---|---|---|---|
| `user` | user | `user_id` | All login accounts (client, coach, admin) |
| `client` | client | `client_id` | Extended client profiles |
| `human_coach` | human_coach | `coach_id` | Coach profiles with approval status |
| `ChatSession` | human_coach | `id` | Live coach-client chat transcript |
| `coach_client` | coach_client | `coach_client_id` | Coach assigned to client |
| `Appointment` | coach_client | `appointment_id` | Scheduled session between coach and client |
| `emotion_data` | emotion_data | `emotion_id` | Single emotion log entry |
| `FinalAssessment` | emotion_data | `assessment_id` | Ollama AI refined emotion analysis |
| `session_log` | session_log | `session_id` | A full therapy session record |
| `ai_guidance` | ai_guidance | `guidance_id` | AI guidance record per interaction |
| `ChatMessage` | ai_guidance | `message_id` | Individual message in AI chat |
| `MessageEmotion` | ai_guidance | `emotion_id` | Emotion analysis of one message |
| `ConversationAnalytics` | ai_guidance | `analytics_id` | Session-level aggregate statistics |
| `notification` | notification | `notification_id` | Notification for a client |
| `coach_feedback` | coach_feedback | — | Client review of a coach |
| `upload_resource` | upload_resource | — | Uploaded resource files |

---

## 9. API Endpoints

All endpoints are served at `http://127.0.0.1:8000`.

### User & Auth
| Method | URL | Description |
|---|---|---|
| POST | `/user/user/` | Register a new user |
| GET | `/user/user/` | List all users |
| POST | `/user/user/login/` | Login — returns user object |

### Client
| Method | URL | Description |
|---|---|---|
| GET | `/client/clients/` | List all clients |
| POST | `/client/clients/` | Create a client profile |
| GET | `/client/clients/{id}/` | Get one client |

### Human Coach
| Method | URL | Description |
|---|---|---|
| GET | `/human_coach/coaches/` | List all coaches |
| POST | `/human_coach/coaches/` | Register as a coach |
| GET | `/human_coach/coaches/{id}/` | Get one coach |
| PUT | `/human_coach/coaches/{id}/approve/` | Approve a coach (admin) |

### Coach-Client & Appointments
| Method | URL | Description |
|---|---|---|
| GET | `/coach_client/coach-clients/` | Get clients for logged-in coach |
| POST | `/coach_client/coach-clients/` | Assign coach to client |
| GET | `/coach_client/appointments/` | List appointments |
| POST | `/coach_client/appointments/` | Book a new appointment |

### Emotion Data
| Method | URL | Description |
|---|---|---|
| GET | `/emotion_data/emotions/` | Get emotions for a client |
| POST | `/emotion_data/emotions/` | Log a new emotion |
| GET | `/emotion_data/assessments/` | Get final assessments |

### Session Logs
| Method | URL | Description |
|---|---|---|
| GET | `/session_log/sessions/` | List all sessions |
| POST | `/session_log/sessions/` | Create a session |
| GET | `/session_log/sessions/{id}/` | Get one session |

### AI Guidance
| Method | URL | Description |
|---|---|---|
| GET | `/ai_guidance/ai-guidance/` | Fetch AI guidance records |
| POST | `/ai_guidance/ai-guidance/` | Send message → get AI response |
| GET | `/api/ai-guidance/check-lock/?client_id=X` | Get risk score and lock status |
| POST | `/api/ai-guidance/assign-coach/` | Assign a coach to a client |
| GET | `/api/ai-guidance/available-coaches/` | List approved coaches |

### Notifications
| Method | URL | Description |
|---|---|---|
| GET | `/api/notifications/?client_id=X` | Get notifications for a client |
| PUT | `/api/notifications/{id}/` | Mark a notification as read |
| POST | `/api/notifications/mark-all-read/` | Mark all as read |
| DELETE | `/api/notifications/{id}/` | Delete a notification |

---

## 10. Key Features Explained

### 1. AI Therapy Chatbot
The user types how they are feeling. The backend:
1. Passes the text through the **BERT emotion classifier** → detects emotion + confidence.
2. Checks for **sarcasm** (adjusts interpretation if detected).
3. Calculates a **risk score** based on emotion, intensity, and crisis keywords.
4. Sends the message to **Ollama LLM** with a therapeutic system prompt → gets a compassionate response.
5. Stores everything (message, emotion, risk score) in the database.
6. Returns the AI response to the frontend.

### 2. Risk Scoring System
Every user interaction produces a risk score (0–100%):
- **0–29%** — Low risk. Regular wellness tracking.
- **30–64%** — Moderate risk. Professional support banner appears.
- **65–89%** — High risk. Stronger prompting to book a coach.
- **90–100%** — Critical. Dashboard may lock; coach is immediately notified.

### 3. Professional Support Banner
Shown to any client with a risk score ≥ 30. Fixed at the top of every dashboard page. Persists until the client dismisses it or books an appointment.

### 4. Appointment Booking
Two entry points:
- **From the Overview page**: "Book Coach Appointment" button → `CoachAppointmentModal`.
- **From the risk banner**: "Book Appointment" button → `ProfessionalCoachBooking` (more detailed modal).

Both modals show the same 4 demo coaches and save appointments to localStorage.

### 5. Coach Accept/Decline with Notification
Coach sees pending requests → Declines → Suggests alternative time → Client gets notification → Client clicks "Book Suggested Time" → New pending request appears on coach dashboard.

### 6. Mood Tracker + Journal
Clients log emotions (1–10 intensity) before each session. After 10+ emotion logs, the `FinalAssessment` Ollama analysis runs and produces a refined emotional profile and recommendation.

### 7. Coach Approval Workflow
New coaches must submit their license ID. An admin approves or rejects the application before the coach can appear in the coach directory.

---

## 11. User Roles & Permissions

| Feature | Client | Coach | Admin |
|---|---|---|---|
| Log emotions | ✅ | ❌ | ❌ |
| Chat with AI | ✅ | ❌ | ❌ |
| Book appointments | ✅ | ❌ | ❌ |
| View own notifications | ✅ | ✅ | ✅ |
| See risk banner | ✅ | ❌ | ❌ |
| View client list | ❌ | ✅ | ✅ |
| Accept/decline appointments | ❌ | ✅ | ❌ |
| View session logs | ❌ | ✅ | ✅ |
| Approve coaches | ❌ | ❌ | ✅ |
| Write journal | ✅ | ❌ | ❌ |
| Upload resources | ❌ | ✅ | ✅ |

---

## 12. Data Flow — How the System Works

### Client Books a Session (Full Flow)

```
1. Client logs in
         │
2. ProtectedDashboardWrapper checks risk score
         │
   Risk ≥ 30%? → Shows "Professional Support Recommended" banner
         │
3. Client clicks "Book Appointment"
         │
4. ProfessionalCoachBooking modal opens
         │
5. Client selects coach, date, time → clicks "Confirm"
         │
6. Backend API called (silently) → may or may not succeed
         │
7. saveAppointmentLocally() ALWAYS runs:
   localStorage["mindwell_appointments"] gets new entry:
   { id, clientName, clientId, coachId, coachName, date, time, status: "pending" }
         │
8. Modal shows "Appointment Confirmed" success screen
         │
9. Coach logs in → CoachDashboard reads mindwell_appointments
         │
10. Coach sees the pending card → clicks Accept or Decline
         │
   Accept path:                    Decline path:
   → status → "accepted"           → Decline modal opens
   → createClientNotification()    → Coach picks date/time/note
   → mindwell_notifications        → status → "declined"
      gets new entry:              → createClientNotification()
      { type: "accepted", ... }      with suggestedDate/Time
         │                                    │
11. Client opens Notifications page
         │
12. mindwell_notifications loaded → "Appointment Updates" section shows
         │
   If accepted:                    If declined + suggested time:
   ✅ "Dr. Sara Khan accepted..."   ❌ "Dr. Sara Khan declined..."
                                   🗓️ "Coach is free: Mon at 14:00"
                                   [Book Suggested Time] button
                                            │
                                   13. Client clicks button
                                            │
                                   14. handleRebook() saves new
                                       pending appointment to localStorage
                                            │
                                   15. Loop back to step 9
```

---

## 13. localStorage — Client-Side Persistence

The app uses localStorage as a demo-safe persistence layer so the full workflow works even when the backend is unavailable.

| Key | Type | What it stores |
|---|---|---|
| `"user"` | JSON object | The logged-in user's data (id, name, email, role, client_id) |
| `"mindwell_appointments"` | JSON array | All booked appointments with status (pending/accepted/declined) |
| `"mindwell_notifications"` | JSON array | Appointment accept/decline notifications for clients |

**Important rule:** `logout()` only removes `"user"`, never `localStorage.clear()`. This preserves appointments and notifications across login sessions so the demo flow always shows persistent data.

**sessionStorage:**

| Key | What it stores |
|---|---|
| `"coach_notification_dismissed_{clientId}"` | Set when the client dismisses the risk banner — prevents it from reappearing in the same browser session |

---

## 14. AI & Machine Learning Pipeline

### Step 1 — Emotion Classification
**File:** `ai_guidance/transformers_classifier.py`

A fine-tuned `DistilBERT` (or `BERT-base`) model trained on a combined mental health dataset with 28 emotion categories:
`joy, sadness, anger, fear, grief, anxiety, disgust, surprise, trust, anticipation, love, remorse, contempt, awe, frustration, hopelessness, confusion, loneliness, shame, guilt, jealousy, pride, relief, boredom, excitement, contentment, gratitude, neutral`

Training was done using `scripts/finetune_transformer.py` on a dataset assembled by `scripts/combine_all_datasets.py`.

If the model file is not present, the classifier falls back to a keyword-rule system.

### Step 2 — Sarcasm Detection
**File:** `ai_guidance/sarcasm_detector.py`

A lightweight binary classifier that checks if the user's message is sarcastic (e.g., "Yeah, I'm totally fine"). If sarcasm is detected, the primary emotion is adjusted (e.g., a "happy" sarcastic statement is re-tagged as "neutral" or "sad").

### Step 3 — Therapeutic Response Generation
**File:** `ai_guidance/ollama_response_generator.py`

Constructs a prompt like:
```
You are a compassionate mental health therapist. The user is feeling [emotion] 
with intensity [X/10]. Their message: "[user text]". Respond with empathy, 
validate their feelings, and offer a brief therapeutic suggestion.
```
Sends this to the local Ollama server (running a model like `llama3.2` or `mistral`) and streams back the response.

### Step 4 — Final Assessment (Ollama + History)
**File:** `emotion_data/ollama_emotion_analyzer.py`

After 10+ emotion logs, combines:
- The last 10 emotion records (type + intensity)
- The client's most recent journal entry

Sends all this to Ollama for a holistic analysis and produces a `FinalAssessment` with a refined emotion, intensity, confidence score, and personalised recommendation.

---

## 15. Risk Assessment System

**File:** `ai_guidance/risk_assessment_service.py`

The risk score (0–100%) is computed from multiple factors:

| Factor | Contribution |
|---|---|
| Base emotion weight | Grief/fear/anger score higher than joy/calm |
| Intensity multiplier | Intensity × emotion weight |
| Crisis keyword detection | Each keyword adds a flat bonus |
| Historical pattern | 3+ consecutive high-risk sessions escalates |
| Session frequency | Frequent short sessions indicate distress |

**Risk thresholds and effects:**

| Score | Label | System Response |
|---|---|---|
| 0–29% | Low | Normal dashboard |
| 30–64% | Moderate | Banner shown, no lockout |
| 65–89% | High | Banner + stronger CTA |
| ≥90% | Critical | Dashboard may be locked, coach immediately notified |

The `ProtectedDashboardWrapper` calls `check-lock` on every login and uses a **demo fallback of 78%** if the API fails, ensuring the banner always demonstrates correctly during a presentation.

---

## 16. Appointment & Notification System

### Full Appointment Object (localStorage)
```json
{
  "id": 1750800000000,
  "clientName": "Nadia Shah",
  "clientId": 3,
  "coachId": 1,
  "coachName": "Dr. Sara Khan",
  "coachSpecialization": "Anxiety & Depression Specialist",
  "date": "2026-06-29",
  "time": "10:00",
  "notes": "",
  "status": "pending",
  "bookedAt": "2026-06-25T10:30:00.000Z"
}
```

### Full Notification Object (localStorage)
```json
{
  "id": 1750800001000,
  "type": "appointment_declined",
  "clientId": 3,
  "clientName": "Nadia Shah",
  "coachId": 1,
  "coachName": "Dr. Sara Khan",
  "coachSpecialization": "Anxiety & Depression Specialist",
  "originalDate": "2026-06-29",
  "originalTime": "10:00",
  "suggestedDate": "2026-07-01",
  "suggestedTime": "14:00",
  "note": "I have a conference on that day.",
  "createdAt": "2026-06-25T11:00:00.000Z",
  "is_read": false
}
```

### Status Lifecycle
```
pending → accepted   (coach clicks Accept)
pending → declined   (coach clicks Decline + enters suggested time)
declined + rebook → new pending  (client clicks "Book Suggested Time")
```

---

*Documentation written for FYP panel presentation — MindWell AI-Driven Mental Health Platform*
