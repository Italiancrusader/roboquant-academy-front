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
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCommunity from './pages/admin/AdminCommunity';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import CourseAnalytics from './pages/admin/CourseAnalytics';
import CourseManagement from './pages/admin/CourseManagement';

const App = () => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, []);

  const AdminCheck = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();

    // Check if user is an admin (you'll need to implement a proper admin check)
    const isAdmin = user?.email === 'timothyhutter@gmail.com';

    if (!user) {
      return <Navigate to="/auth" />;
    }

    return isAdmin ? <>{children}</> : <Navigate to="/dashboard" />;
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<CourseLesson />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/mt5-report-genie" element={<MT5ReportGenie />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/community" element={<Community />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminCheck><AdminDashboard /></AdminCheck>} />
          <Route path="/admin/dashboard" element={<AdminCheck><AdminDashboard /></AdminCheck>} />
          <Route path="/admin/courses" element={<AdminCheck><AdminCourses /></AdminCheck>} />
          <Route path="/admin/courses/:courseId/analytics" element={<AdminCheck><CourseAnalytics /></AdminCheck>} />
          <Route path="/admin/users" element={<AdminCheck><AdminUsers /></AdminCheck>} />
          <Route path="/admin/community" element={<AdminCheck><AdminCommunity /></AdminCheck>} />
          <Route path="/admin/analytics" element={<AdminCheck><AdminAnalytics /></AdminCheck>} />
          <Route path="/admin/course-management" element={<AdminCheck><CourseManagement /></AdminCheck>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
