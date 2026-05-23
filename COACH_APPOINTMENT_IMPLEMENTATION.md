# Coach Appointment Booking Implementation

## Summary
Successfully implemented a complete coach appointment booking system with high-risk user data for testing.

## What Was Created

### 1. High-Risk User Data
- **Script**: `backend/FYP_Backend-main/create_high_risk_user.py`
- **User Created**: 
  - Name: Alex Johnson
  - Email: highrisk.user@example.com
  - Password: password123
  - Client ID: 56
- **Data Generated**:
  - 34 therapy sessions over 3 months (Feb 16 - May 17, 2026)
  - 27 high-risk sessions (79.4% risk rate - well above 60%)
  - Mix of emotions: anxious, depressed, hopeless, overwhelmed, stressed, sad, angry
  - Realistic chat messages and emotion analysis

### 2. Approved Coaches
- **Script**: `backend/FYP_Backend-main/create_approved_coaches.py`
- **Coaches Created**:
  1. Dr. Sarah Mitchell (ID: 13) - Specialization: Anxiety & Depression
  2. Dr. James Wilson (ID: 14) - Specialization: Stress Management
  3. Dr. Emily Brown (ID: 15) - Specialization: Emotional Well-being

### 3. Backend Implementation

#### New Model: Appointment
- Location: `backend/FYP_Backend-main/coach_client/models.py`
- Fields:
  - appointment_id (Auto)
  - coach_id (ForeignKey to human_coach)
  - client_id (ForeignKey to client)
  - appointment_date (DateTime)
  - duration_minutes (Integer, default 60)
  - status (pending, confirmed, cancelled, completed)
  - notes (Text, optional)
  - created_at, updated_at (Auto timestamps)

#### New API Endpoints
- **GET** `/api/coach-client/available-coaches/` - List all approved coaches
- **POST** `/api/coach-client/appointments/` - Book new appointment
- **GET** `/api/coach-client/appointments/client/<client_id>/` - Get client's appointments
- **GET/PUT/DELETE** `/api/coach-client/appointments/<id>/` - Manage specific appointment

#### New Serializers
- `CoachListSerializer` - For displaying available coaches
- `AppointmentSerializer` - For appointment booking and management

### 4. Frontend Implementation

#### New Component: CoachAppointmentModal
- Location: `frontend/src/components/CoachAppointmentModal.tsx`
- Features:
  - Beautiful modal with gradient design
  - Coach selection with profile cards
  - Date/time picker for appointment scheduling
  - Optional notes field
  - Real-time validation
  - Success confirmation
  - Error handling

#### Updated Overview Page
- Added "Book Coach Appointment" button in Quick Actions section
- Integrated CoachAppointmentModal component
- Added Calendar icon from lucide-react
- Styled with tertiary button class (purple gradient)

#### Updated CSS
- Added `.quick-btn.tertiary` styling in `Overview.css`
- Purple gradient theme (#6C7ABD to #6B9B8A)
- Hover effects and animations

## How to Use

### Login as High-Risk User
1. Navigate to the application login page
2. Use credentials:
   - Email: `highrisk.user@example.com`
   - Password: `password123`

### Book an Appointment
1. Go to Dashboard Overview
2. Click the "Book Coach Appointment" button (purple button with calendar icon)
3. Select a coach from the list (Dr. Sarah Mitchell, Dr. James Wilson, or Dr. Emily Brown)
4. Choose a date and time for the appointment
5. Optionally add notes about what you want to discuss
6. Click "Book Appointment"
7. Success! The appointment is created with "pending" status

### View Appointments (Future Enhancement)
The API endpoint is ready: `GET /api/coach-client/appointments/client/56/`
You can add a "My Appointments" page to display booked appointments.

## Database Migrations
- Migration created: `coach_client/migrations/0002_appointment.py`
- Migration applied successfully

## Testing
All components tested and verified:
- ✅ High-risk user created with 79.4% risk score
- ✅ 3 approved coaches created and available
- ✅ Appointment model created and migrated
- ✅ API endpoints working
- ✅ Frontend modal opens and displays coaches
- ✅ Appointment booking flow functional

## Technical Details

### Backend Stack
- Django REST Framework
- SQLite Database
- Django Models & Serializers
- DateTimeField validation (ensures future dates)

### Frontend Stack
- React + TypeScript
- Framer Motion (animations)
- Lucide React (icons)
- Axios (API calls)
- Gradient-based modern UI design

## Notes
- All appointments default to 60 minutes duration
- Appointments start with "pending" status
- Date validation ensures appointments can only be booked for future dates
- The system prevents booking appointments in the past
- Coach profiles include specialization and license information
- Client can see coach credentials before booking

## Future Enhancements
1. Add "My Appointments" page to view booked appointments
2. Add appointment cancellation functionality
3. Add coach availability calendar
4. Add email notifications for appointments
5. Add appointment reminders
6. Add video call integration for virtual sessions
7. Add coach review/rating system after completed sessions
