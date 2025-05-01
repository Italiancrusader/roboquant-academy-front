
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseLesson from './pages/CourseLesson';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ClassroomOverview from './pages/ClassroomOverview';
import ProtectedRoute from './components/ProtectedRoute';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import MT5ReportGenie from './pages/MT5ReportGenie';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import LessonManagement from './pages/admin/LessonManagement';
import AllLessonsManagement from './pages/admin/AllLessonsManagement';
import AdminCheck from './components/admin/AdminCheck';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminCommunity from './pages/admin/AdminCommunity';
import AdminCertificates from './pages/admin/AdminCertificates';
import CourseConfigPage from './pages/admin/CourseConfigPage'; // Import the new page

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<CourseLesson />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/classroom" element={<ClassroomOverview />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mt5-report-genie" element={<MT5ReportGenie />} />
          </Route>
          
          {/* Admin Routes */}
          <Route element={<AdminCheck />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/courses" element={<CourseManagement />} />
            <Route path="/admin/courses/:courseId/lessons" element={<LessonManagement />} />
            <Route path="/admin/courses/:courseId/configure" element={<CourseConfigPage />} /> {/* Add new route */}
            <Route path="/admin/lessons" element={<AllLessonsManagement />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/community" element={<AdminCommunity />} />
            <Route path="/admin/certificates" element={<AdminCertificates />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
