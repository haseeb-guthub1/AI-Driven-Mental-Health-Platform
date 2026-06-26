import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import DashboardLayout from './pages/Dashboard'; // Ensure this file has the <Outlet />
import Overview from './pages/Overview';
import MoodTracker from './pages/MoodTracker';
import Patients from './pages/Patients';
import AIGuidance from './pages/AIGuidance';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import CoachDashboard from './pages/CoachDashboard';
import CoachApproval from './pages/CoachApproval';
import SessionDetail from './pages/SessionDetail';
import SelectCoach from './pages/SelectCoach';
import SessionLogs from './pages/SessionLogs';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route: Login/Signup */}
        <Route path="/" element={<Auth />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          
          {/* Default view: /dashboard */}
          <Route index element={<Overview />} />
          
          {/* Client Specific Routes */}
          
          <Route path="mood-tracker" element={<MoodTracker />} />
          <Route path="ai-assistant" element={<AIGuidance />} />
          <Route path="session/:sessionId" element={<SessionDetail />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="select-coach" element={<SelectCoach />} />
          
          {/* Coach Specific Routes */}
          <Route path="patients" element={<Patients />} />
          <Route path="coach-overview" element={<CoachDashboard />} />
          <Route path="session-logs" element={<SessionLogs />} />
          
          {/* Admin/Superuser Routes */}
          <Route path="coach-approval" element={<CoachApproval />} />
          
          {/* Dashboard Catch-all: Redirects unknown dashboard paths to Overview */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Route>

        {/* Global Catch-all: Redirects everything else to Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;