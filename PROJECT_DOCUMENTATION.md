# 🧠 AI Mental Health Coach Platform - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Backend - Django REST API](#backend---django-rest-api)
5. [Frontend - React Application](#frontend---react-application)
6. [Key Features](#key-features)
7. [Database Models](#database-models)
8. [API Endpoints](#api-endpoints)
9. [Setup & Installation](#setup--installation)
10. [Running the Application](#running-the-application)

---

## 🎯 Project Overview

**AI Mental Health Coach Platform** is a comprehensive mental health support system that combines:
- **AI-Powered Therapy Sessions** using Fine-tuned BERT for emotion detection and Ollama Llama 3.2 for natural language generation
- **Human Coach Management** system for professional oversight
- **Client Progress Tracking** with mood tracking and session logs
- **Multi-Role Support** (Client, Coach, Admin/Superuser)

### Purpose
To provide accessible, empathetic mental health support through AI-assisted conversations while maintaining human coach oversight for critical cases.

### Core Capabilities
- Real-time emotion detection from user messages (87.5% accuracy)
- Context-aware AI responses tailored to user emotions
- Session history and progress analytics
- Coach-client assignment and management
- Crisis detection and escalation to human coaches
- Notification system for important updates

---

## 💻 Technology Stack

### Backend
- **Framework**: Django 6.0.2
- **API**: Django REST Framework 3.16.1
- **Database**: SQLite (Development)
- **Authentication**: Token-based authentication
- **CORS**: django-cors-headers
- **AI Models**:
  - Fine-tuned BERT for emotion classification (87.5% accuracy)
  - Ollama Llama 3.2:3b (Local LLM - 2.0 GB)

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 7.3.0
- **Routing**: React Router DOM
- **Styling**: CSS Modules
- **HTTP Client**: Axios/Fetch API
- **Animations**: Framer Motion (particles effects)

### Python Dependencies (Backend)
```
Django==6.0.2
djangorestframework==3.16.1
django-cors-headers==4.6.0
torch>=2.0.0
transformers>=4.30.0
ollama (python client for Llama)
numpy
pandas
scikit-learn
```

### Node Dependencies (Frontend)
```
react: ^18.x
react-router-dom: ^6.x
typescript: ^5.x
vite: ^7.x
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TS)                    │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │  Auth    │ Overview │  Mood    │   AI     │ Settings │  │
│  │  Page    │  Page    │ Tracker  │ Assistant│   Page   │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│  ┌──────────┬──────────┬────────────────────────────────┐  │
│  │ Patients │  Coach   │    Coach Approval (Admin)      │  │
│  │   Page   │Dashboard │                                 │  │
│  └──────────┴──────────┴────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         │ (Port 5173 → Port 8000)
┌────────────────────────▼────────────────────────────────────┐
│              Django REST API (Backend)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ URL Router → View → Serializer → Model → Database  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Django Apps:                                               │
│  ├── user (Authentication & User Management)                │
│  ├── client (Client Profiles)                               │
│  ├── ai_guidance (AI Therapy & Chat Messages)               │
│  ├── session_log (Therapy Session Tracking)                 │
│  ├── emotion_data (Emotion Detection Results)               │
│  ├── coach_client (Coach-Client Assignments)                │
│  ├── human_coach (Human Coach Profiles & Licensing)         │
│  ├── coach_feedback (Coach Notes & Feedback)                │
│  ├── notification (Alert System)                            │
│  └── upload_resource (Resource Sharing)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI Processing Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. User Message → BERT Emotion Classifier           │  │
│  │     → Emotion (joy, sadness, anger, fear, etc.)      │  │
│  │  2. Emotion + Message → Ollama Llama 3.2            │  │
│  │     → Context-aware Empathetic Response               │  │
│  │  3. Crisis Detection → Escalate to Human Coach       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend - Django REST API

### Project Structure
```
backend/FYP_Backend-main/
├── manage.py                    # Django management script
├── db.sqlite3                   # SQLite database
├── myproject/                   # Main project settings
│   ├── settings.py             # Django configuration
│   ├── urls.py                 # URL routing
│   └── wsgi.py                 # WSGI entry point
├── ai_guidance/                # AI therapy & chat system
│   ├── models.py               # ai_guidance, ChatMessage, MessageEmotion
│   ├── views.py                # API endpoints for AI chat
│   ├── serializers.py          # Data serialization
│   ├── ollama_response_generator.py  # Ollama integration
│   └── emotion_response_generator_v2.py  # BERT emotion detection
├── user/                       # User authentication
│   ├── models.py               # User model
│   ├── views.py                # Login, registration endpoints
│   └── serializers.py
├── client/                     # Client profiles
│   ├── models.py               # Client model
│   ├── views.py
│   └── serializers.py
├── session_log/                # Therapy session tracking
│   ├── models.py               # Session logs with summaries
│   ├── views.py
│   └── serializers.py
├── emotion_data/               # Emotion detection data
│   ├── models.py               # Emotion records
│   └── views.py
├── coach_client/               # Coach-client relationships
│   ├── models.py               # Assignment records
│   └── views.py
├── human_coach/                # Human coach management
│   ├── models.py               # Coach profiles, licenses
│   └── views.py
├── coach_feedback/             # Coach notes & feedback
│   ├── models.py
│   └── views.py
├── notification/               # Notification system
│   ├── models.py
│   └── views.py
├── upload_resource/            # Resource sharing
│   ├── models.py
│   └── views.py
└── venv/                       # Python virtual environment
```

### Django Settings Highlights

**Installed Apps:**
```python
INSTALLED_APPS = [
    'corsheaders',              # Enable frontend access
    'django.contrib.admin',
    'rest_framework',           # REST API framework
    'rest_framework.authtoken', # Token authentication
    'ai_guidance',
    'client',
    'coach_client',
    'coach_feedback',
    'emotion_data',
    'human_coach',
    'notification',
    'session_log',
    'upload_resource',
    'user',
]
```

**REST Framework Configuration:**
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

**CORS Configuration:**
```python
CORS_ALLOW_ALL_ORIGINS = True  # Development only
```

---

## 🎨 Frontend - React Application

### Project Structure
```
frontend/
├── public/                     # Static assets
├── src/
│   ├── main.tsx               # Application entry point
│   ├── App.tsx                # Main routing component
│   ├── App.css                # Global styles
│   ├── index.css              # Base styles
│   ├── pages/                 # Page components
│   │   ├── Auth.tsx           # Login/Signup page
│   │   ├── Dashboard.tsx      # Main dashboard layout
│   │   ├── Overview.tsx       # Dashboard overview
│   │   ├── MoodTracker.tsx    # Mood tracking interface
│   │   ├── AIGuidance.tsx     # AI chat interface
│   │   ├── Journal.tsx        # Personal journal
│   │   ├── Patients.tsx       # Coach's patient list
│   │   ├── CoachDashboard.tsx # Coach overview
│   │   ├── CoachApproval.tsx  # Admin coach approval
│   │   ├── Notifications.tsx  # Notification center
│   │   └── Settings.tsx       # User settings
│   ├── components/            # Reusable components
│   ├── services/              # API service layer
│   └── assets/                # Images, icons
├── package.json
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
└── eslint.config.js           # Linting rules
```

### Routes Configuration

```tsx
<Routes>
  {/* Public Route */}
  <Route path="/" element={<Auth />} />

  {/* Protected Dashboard Routes */}
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<Overview />} />
    
    {/* Client Routes */}
    <Route path="mood-tracker" element={<MoodTracker />} />
    <Route path="ai-assistant" element={<AIGuidance />} />
    <Route path="notifications" element={<Notifications />} />
    <Route path="settings" element={<Settings />} />
    
    {/* Coach Routes */}
    <Route path="patients" element={<Patients />} />
    <Route path="coach-overview" element={<CoachDashboard />} />
    
    {/* Admin Routes */}
    <Route path="coach-approval" element={<CoachApproval />} />
  </Route>
</Routes>
```

### User Roles & Access
- **Client**: Access to mood tracker, AI assistant, notifications, settings
- **Coach**: Access to patient list, coach dashboard, coach overview
- **Admin/Superuser**: Access to coach approval system

---

## ✨ Key Features

### 1. AI-Powered Therapy Sessions
**How it works:**
1. User sends a message in the AI Assistant page
2. Backend receives message and processes through BERT emotion classifier
3. Detected emotion (with 87.5% accuracy) guides response generation
4. Ollama Llama 3.2 generates empathetic, context-aware response
5. Response sent back to user with emotion metadata
6. All messages stored in ChatMessage model with timestamps

**Emotion Detection:**
- Primary emotions: joy, sadness, anger, fear, surprise, neutral, etc.
- Confidence scores (0.0 - 1.0)
- Intensity levels (1-10)
- Crisis keyword detection for risk assessment

**Response Generation:**
- Context-aware: Uses conversation history
- Empathetic: Tailored to detected emotion
- Real-time: Typically 20-30 seconds response time
- Fallback system: Automatic fallback if Ollama unavailable

### 2. Session Management
- Automatic session tracking for each conversation
- Session summaries generated using AI
- Duration tracking and message counts
- Emotion analytics per session:
  - Dominant emotions
  - Average emotional intensity
  - Emotion transitions throughout session

### 3. Human Coach Oversight
**Coach Features:**
- View assigned clients and their progress
- Access client session histories and emotion data
- Add feedback notes to client sessions
- License verification system
- Crisis escalation notifications

**Coach Approval System (Admin):**
- Admins review and approve new coach registrations
- License validation
- Status management (active/inactive)

### 4. Mood Tracking
- Clients can log daily moods
- Visual tracking of mood trends over time
- Integration with session data
- Mood correlation with therapy progress

### 5. Notification System
- Real-time alerts for:
  - Crisis detection requiring coach intervention
  - New coach assignments
  - Session completion confirmations
  - System updates
- Role-based notifications

### 6. Resource Sharing
- Coaches can upload and share resources
- Clients access shared materials
- Support for PDFs, documents, videos

---

## 📊 Database Models

### User Model
```python
class user(models.Model):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=50)  # client, coach, admin
    created_at = models.DateField(auto_now_add=True)
```

### Client Model
```python
class client(models.Model):
    client_id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(user, on_delete=models.CASCADE)
    age = models.IntegerField()
    location = models.CharField(max_length=100)
    medical_history = models.TextField()
    emergency_contact = models.CharField(max_length=100)
```

### Human Coach Model
```python
class human_coach(models.Model):
    coach_id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(user, on_delete=models.CASCADE)
    specialization = models.CharField(max_length=100)
    license_number = models.CharField(max_length=100)
    status = models.CharField(max_length=50)  # active, pending, inactive
```

### Session Log Model
```python
class session_log(models.Model):
    session_id = models.AutoField(primary_key=True)
    client_id = models.ForeignKey(client, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration = models.IntegerField()
    summary = models.TextField()  # AI-generated summary
```

### ChatMessage Model
```python
class ChatMessage(models.Model):
    message_id = models.AutoField(primary_key=True)
    session_id = models.ForeignKey(session_log, on_delete=models.CASCADE)
    client_id = models.ForeignKey(client, on_delete=models.CASCADE)
    message_type = models.CharField(max_length=10)  # 'user' or 'ai'
    message_text = models.TextField()
    timestamp = models.DateTimeField()
    tokens_used = models.IntegerField()
    response_time = models.FloatField()
```

### MessageEmotion Model
```python
class MessageEmotion(models.Model):
    emotion_id = models.AutoField(primary_key=True)
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE)
    primary_emotion = models.CharField(max_length=50)
    emotion_confidence = models.FloatField()  # 0.0 to 1.0
    intensity = models.IntegerField()  # 1 to 10
    secondary_emotions = models.JSONField()
    sentiment_score = models.FloatField()  # -1.0 to 1.0
    risk_level = models.CharField(max_length=20)  # low, moderate, high, critical
```

### AI Guidance Model
```python
class ai_guidance(models.Model):
    guidance_id = models.AutoField(primary_key=True)
    client_id = models.ForeignKey(client, on_delete=models.CASCADE)
    session_id = models.ForeignKey(session_log, on_delete=models.CASCADE)
    emotion_id = models.ForeignKey(emotion_data, on_delete=models.CASCADE)
    suggestion = models.TextField()
    user_message = models.TextField()
    ai_response = models.TextField()
    effectiveness = models.IntegerField()
    created_at = models.DateTimeField()
```

### Coach-Client Assignment
```python
class coach_client(models.Model):
    coach_client_id = models.AutoField(primary_key=True)
    coach_id = models.ForeignKey(human_coach, on_delete=models.CASCADE)
    client_id = models.ForeignKey(client, on_delete=models.CASCADE)
    assigned_date = models.DateField()
    status = models.CharField(max_length=50)  # active, inactive, completed
```

### Notification Model
```python
class notification(models.Model):
    notification_id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(user, on_delete=models.CASCADE)
    message = models.TextField()
    notification_type = models.CharField(max_length=50)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField()
```

---

## 🔗 API Endpoints

### Base URL
- Backend: `http://127.0.0.1:8000`
- Frontend: `http://localhost:5173`

### Authentication
```
POST /api/user/login/
Body: { "email": "user@example.com", "password": "password123" }
Response: { "token": "abc123...", "user_id": 1, "role": "client" }
```

### User Management
```
GET    /api/user/              # List all users
POST   /api/user/              # Create new user
GET    /api/user/{id}/         # Get user details
PUT    /api/user/{id}/         # Update user
DELETE /api/user/{id}/         # Delete user
```

### Client Management
```
GET    /api/client/            # List all clients
POST   /api/client/            # Create new client
GET    /api/client/{id}/       # Get client details
```

### AI Guidance & Chat
```
GET    /api/ai-guidance/       # List AI guidance records
POST   /api/ai-guidance/       # Create new guidance/chat message
GET    /api/ai-guidance/{id}/  # Get specific guidance
```

### Session Management
```
GET    /api/sessions/                      # List all sessions
POST   /api/sessions/                      # Create new session
GET    /api/sessions/{id}/                 # Get session details
GET    /api/sessions/{id}/summary/         # Get AI-generated summary
```

### Coach Management
```
GET    /api/human_coach/       # List all coaches
POST   /api/human_coach/       # Register new coach
GET    /api/human_coach/{id}/  # Get coach details
PUT    /api/human_coach/{id}/  # Update coach (admin approval)
```

### Coach-Client Assignments
```
GET    /api/coach_client/      # List assignments
POST   /api/coach_client/      # Create new assignment
GET    /api/coach_client/{id}/ # Get assignment details
```

### Notifications
```
GET    /api/notification/      # List user's notifications
POST   /api/notification/      # Create notification
PUT    /api/notification/{id}/ # Mark as read
```

### Emotion Data
```
GET    /api/emotion-data/      # List emotion records
POST   /api/emotion-data/      # Create emotion record
```

### Coach Feedback
```
GET    /api/coach_feedback/    # List feedback
POST   /api/coach_feedback/    # Add feedback to session
```

### Upload Resources
```
GET    /api/upload_resource/   # List resources
POST   /api/upload_resource/   # Upload new resource
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm
- Git
- Ollama (for local LLM inference)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd "E:\MY PROJECTS\FYP\backend\FYP_Backend-main"
```

2. **Create and activate virtual environment:**
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
```

3. **Install Python dependencies:**
```bash
pip install Django==6.0.2
pip install djangorestframework
pip install django-cors-headers
pip install torch transformers
pip install ollama
pip install numpy pandas scikit-learn
```

4. **Run migrations:**
```bash
python manage.py migrate
```

5. **Create superuser (admin):**
```bash
python manage.py createsuperuser
```

6. **Install Ollama and download Llama model:**
```bash
# Download Ollama from https://ollama.ai
ollama pull llama3.2:3b  # Downloads 2.0 GB model
```

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd "E:\MY PROJECTS\FYP\frontend"
```

2. **Install Node dependencies:**
```bash
npm install
```

3. **Verify package.json has required dependencies:**
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^7.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

---

## ▶️ Running the Application

### Start Backend Server

1. **Activate virtual environment:**
```bash
cd "E:\MY PROJECTS\FYP\backend\FYP_Backend-main"
.\venv\Scripts\Activate.ps1
```

2. **Start Django server:**
```bash
python manage.py runserver
```

Server will start at: `http://127.0.0.1:8000/`

**Verify backend is running:**
- Visit `http://127.0.0.1:8000/` - Should show API root with endpoint list
- Visit `http://127.0.0.1:8000/admin/` - Django admin panel

### Start Frontend Development Server

1. **Open new terminal and navigate to frontend:**
```bash
cd "E:\MY PROJECTS\FYP\frontend"
```

2. **Start Vite dev server:**
```bash
npm run dev
```

Server will start at: `http://localhost:5173/`

### Start Ollama Service

1. **Ensure Ollama is running:**
```bash
ollama serve
```

2. **Verify model is loaded:**
```bash
ollama list
```

Should show `llama3.2:3b` (2.0 GB)

### Access the Application

1. **Open browser to:** `http://localhost:5173/`
2. **Login or create account**
3. **Select role:**
   - **Client**: Access mood tracker and AI assistant
   - **Coach**: Access patient management
   - **Admin**: Access coach approval system

---

## 📝 Development Workflow

### Making Changes

**Backend Changes:**
1. Edit Python files in respective Django apps
2. Django auto-reloads on file changes
3. Run migrations if models change: `python manage.py makemigrations && python manage.py migrate`

**Frontend Changes:**
1. Edit TypeScript/TSX files in `src/` directory
2. Vite auto-reloads on file changes
3. Changes appear instantly in browser

### Testing

**Backend API Testing:**
- Use Django REST Framework browsable API at `http://127.0.0.1:8000/`
- Use Postman or curl for API testing
- Django admin at `http://127.0.0.1:8000/admin/`

**Frontend Testing:**
- Browser DevTools console for debugging
- React DevTools extension recommended

### Database Management

**View database:**
```bash
python manage.py dbshell
```

**Create database backup:**
```bash
cp db.sqlite3 db.backup.sqlite3
```

**Reset database:**
```bash
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

---

## 🔐 Security Notes

**⚠️ Important for Production:**

1. **Change SECRET_KEY** in `settings.py`
2. **Set DEBUG = False** in production
3. **Configure ALLOWED_HOSTS** properly
4. **Use PostgreSQL** instead of SQLite
5. **Enable HTTPS** for all communications
6. **Implement rate limiting** on API endpoints
7. **Add input validation** and sanitization
8. **Use environment variables** for sensitive data
9. **Regular security audits** and updates

---

## 🎯 Project Goals Achieved

✅ AI-powered mental health support system  
✅ Real-time emotion detection with high accuracy (87.5%)  
✅ Context-aware empathetic responses using local LLM  
✅ Multi-role support (Client, Coach, Admin)  
✅ Human coach oversight and crisis escalation  
✅ Session tracking and analytics  
✅ Mood tracking and progress monitoring  
✅ Notification system  
✅ Resource sharing capabilities  
✅ RESTful API architecture  
✅ Modern responsive UI with React + TypeScript  
✅ Token-based authentication  
✅ Coach approval workflow  

---

## 📞 Support & Maintenance

### Common Issues

**Backend won't start:**
- Ensure virtual environment is activated
- Check Python version (3.10+)
- Verify all dependencies installed: `pip list`
- Check port 8000 is not in use

**Frontend won't start:**
- Delete `node_modules` and run `npm install` again
- Check Node version (18+)
- Verify port 5173 is available
- Clear npm cache: `npm cache clean --force`

**Ollama not responding:**
- Ensure Ollama service is running: `ollama serve`
- Check model is downloaded: `ollama list`
- Verify Ollama port (default: 11434)
- System fallback will activate if Ollama unavailable

**Cannot login:**
- Verify user exists in database
- Check Django admin for user records
- Ensure password meets validation requirements
- Check CORS settings allow frontend domain

---

## 📚 Additional Resources

### Django Documentation
- Official Docs: https://docs.djangoproject.com/
- REST Framework: https://www.django-rest-framework.org/

### React Documentation
- React Docs: https://react.dev/
- React Router: https://reactrouter.com/
- TypeScript: https://www.typescriptlang.org/

### AI/ML Resources
- Hugging Face Transformers: https://huggingface.co/docs/transformers
- Ollama: https://ollama.ai/
- BERT: https://arxiv.org/abs/1810.04805

---

## 🏁 Conclusion

This AI Mental Health Coach Platform successfully combines cutting-edge AI technology with human oversight to provide accessible, empathetic mental health support. The system demonstrates:

- **High accuracy emotion detection** (87.5%) using fine-tuned BERT
- **Natural language generation** with locally-run Llama 3.2
- **Comprehensive session tracking** and analytics
- **Multi-stakeholder support** (Clients, Coaches, Admins)
- **Crisis detection and escalation** mechanisms
- **Modern, responsive interface** built with React + TypeScript
- **Scalable RESTful API** architecture

The platform is production-ready with additional security hardening and can serve as a foundation for real-world mental health support applications.

---

**Project Status**: ✅ Complete & Operational  
**Last Updated**: April 2026  
**Version**: 1.0  
