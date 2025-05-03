
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import PricingPage from './pages/PricingPage';
import Contact from './pages/Contact';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseLesson from './pages/CourseLesson';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import MT5ReportGenie from './pages/MT5ReportGenie';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Community from './pages/Community';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminCheck from '@/components/admin/AdminCheck';
import ProtectedRoute from '@/components/ProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCommunity from './pages/admin/AdminCommunity';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import CourseAnalytics from './pages/admin/CourseAnalytics';
import CourseManagement from './pages/admin/CourseManagement';
import AdminPayments from './pages/admin/AdminPayments';
import AllLessonsManagement from './pages/admin/AllLessonsManagement';
import LessonManagement from './pages/admin/LessonManagement';
import CourseConfigPage from './pages/admin/CourseConfigPage';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminUsers from './pages/admin/AdminUsers';

const App = () => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<ProtectedRoute><CourseLesson /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/mt5-report-genie" element={<MT5ReportGenie />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/community" element={<Community />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminCheck><AdminDashboard /></AdminCheck>} />
          <Route path="/admin/dashboard" element={<AdminCheck><AdminDashboard /></AdminCheck>} />
          <Route path="/admin/courses" element={<AdminCheck><CourseManagement /></AdminCheck>} />
          <Route path="/admin/users" element={<AdminCheck><AdminUsers /></AdminCheck>} />
          <Route path="/admin/courses/:courseId/analytics" element={<AdminCheck><CourseAnalytics /></AdminCheck>} />
          <Route path="/admin/courses/:courseId/lessons" element={<AdminCheck><LessonManagement /></AdminCheck>} />
          <Route path="/admin/courses/:courseId/configure" element={<AdminCheck><CourseConfigPage /></AdminCheck>} />
          <Route path="/admin/community" element={<AdminCheck><AdminCommunity /></AdminCheck>} />
          <Route path="/admin/analytics" element={<AdminCheck><AdminAnalytics /></AdminCheck>} />
          <Route path="/admin/lessons" element={<AdminCheck><AllLessonsManagement /></AdminCheck>} />
          <Route path="/admin/payments" element={<AdminCheck><AdminPayments /></AdminCheck>} />
          <Route path="/admin/certificates" element={<AdminCheck><AdminCertificates /></AdminCheck>} />
          <Route path="/admin/notifications" element={<AdminCheck><AdminNotifications /></AdminCheck>} />
          <Route path="/admin/settings" element={<AdminCheck><AdminSettings /></AdminCheck>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
