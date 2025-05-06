
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import MT5ReportGenie from './pages/MT5ReportGenie';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import PricingPage from './pages/PricingPage';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import BookCall from './pages/BookCall';
import Community from './pages/Community';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseLesson from './pages/CourseLesson';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCommunity from './pages/admin/AdminCommunity';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminNotifications from './pages/admin/AdminNotifications';
import CourseManagement from './pages/admin/CourseManagement';
import LessonManagement from './pages/admin/LessonManagement';
import CourseConfigPage from './pages/admin/CourseConfigPage';
import CourseAnalytics from './pages/admin/CourseAnalytics';
import AdminCheck from './components/admin/AdminCheck';
import AdminEmailTesting from './pages/admin/AdminEmailTesting';
import AllLessonsManagement from './pages/admin/AllLessonsManagement';
import { AuthProvider } from './contexts/AuthContext';
import { Toast } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from './contexts/CartContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query/devtools';
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { MetaPixel } from './components/MetaPixel';
import { CrispChat } from './components/CrispChat';

const queryClient = new QueryClient();

function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  // Conditionally set the background color based on the route
  const backgroundColor = isAdminRoute ? '#0F1117' : '#0F1117';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <div className="App" style={{ backgroundColor, minHeight: '100vh' }}>
            <GoogleAnalytics />
            <MetaPixel />
            <CrispChat />
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/mt5-report-genie" element={<MT5ReportGenie />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/book-call" element={<BookCall />} />
                <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route
                  path="/courses/:courseId/lessons/:lessonId"
                  element={<ProtectedRoute><CourseLesson /></ProtectedRoute>}
                />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminCheck><AdminDashboard /></AdminCheck>} />
                <Route path="/admin/dashboard" element={<AdminCheck><AdminDashboard /></AdminCheck>} />
                <Route path="/admin/courses" element={<AdminCheck><AdminCourses /></AdminCheck>} />
                <Route path="/admin/courses/config/:courseId" element={<AdminCheck><CourseConfigPage /></AdminCheck>} />
                <Route path="/admin/courses/analytics/:courseId" element={<AdminCheck><CourseAnalytics /></AdminCheck>} />
                <Route path="/admin/courses/all-lessons" element={<AdminCheck><AllLessonsManagement /></AdminCheck>} />
                <Route path="/admin/users" element={<AdminCheck><AdminUsers /></AdminCheck>} />
                <Route path="/admin/settings" element={<AdminCheck><AdminSettings /></AdminCheck>} />
                <Route path="/admin/analytics" element={<AdminCheck><AdminAnalytics /></AdminCheck>} />
                <Route path="/admin/payments" element={<AdminCheck><AdminPayments /></AdminCheck>} />
                <Route path="/admin/community" element={<AdminCheck><AdminCommunity /></AdminCheck>} />
                <Route path="/admin/certificates" element={<AdminCheck><AdminCertificates /></AdminCheck>} />
                <Route path="/admin/notifications" element={<AdminCheck><AdminNotifications /></AdminCheck>} />
                <Route path="/admin/course-management" element={<AdminCheck><CourseManagement /></AdminCheck>} />
                <Route path="/admin/lesson-management" element={<AdminCheck><LessonManagement /></AdminCheck>} />
                <Route path="/admin/email-testing" element={<AdminCheck><AdminEmailTesting /></AdminCheck>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster />
          </div>
        </CartProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
