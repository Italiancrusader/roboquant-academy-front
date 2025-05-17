import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimpleLanding from './pages/SimpleLanding';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
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
import Quiz from './pages/Quiz';
import VSL from './pages/VSL';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import SurveyFunnel from './pages/SurveyFunnel';
import StrategyReportGeniePage from './pages/StrategyReportGenie';

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
// Fix: Import ReactQueryDevtools from the correct separate package
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { MetaPixel } from './components/MetaPixel';

const queryClient = new QueryClient();

function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const backgroundColor = isAdminRoute ? '#0F1117' : '#0F1117';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <div className="App" style={{ backgroundColor, minHeight: '100vh' }}>
            <Router>
              <GoogleAnalytics />
              <MetaPixel />
              <Routes>
                {/* Use Index as the main route (full version) */}
                <Route path="/" element={<Index />} />
                
                {/* Keep SimpleLanding as a separate route if needed */}
                <Route path="/simple" element={<SimpleLanding />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Add explicit routes for OAuth callbacks */}
                <Route path="/auth/v1/callback" element={<Auth />} />
                <Route path="/auth/callback" element={<Auth />} />
                
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
                
                {/* Sales Funnel Routes */}
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/vsl" element={<VSL />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/thank-you" element={<ThankYou />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminCheck><AdminDashboard /></AdminCheck>} />
                <Route path="/admin/dashboard" element={<AdminCheck><AdminDashboard /></AdminCheck>} />
                <Route path="/admin/courses" element={<AdminCheck><AdminCourses /></AdminCheck>} />
                <Route path="/admin/courses/:courseId/configure" element={<AdminCheck><CourseConfigPage /></AdminCheck>} />
                <Route path="/admin/courses/:courseId/analytics" element={<AdminCheck><CourseAnalytics /></AdminCheck>} />
                <Route path="/admin/lessons" element={<AdminCheck><AllLessonsManagement /></AdminCheck>} />
                <Route path="/admin/users" element={<AdminCheck><AdminUsers /></AdminCheck>} />
                <Route path="/admin/settings" element={<AdminCheck><AdminSettings /></AdminCheck>} />
                <Route path="/admin/analytics" element={<AdminCheck><AdminAnalytics /></AdminCheck>} />
                <Route path="/admin/payments" element={<AdminCheck><AdminPayments /></AdminCheck>} />
                <Route path="/admin/community" element={<AdminCheck><AdminCommunity /></AdminCheck>} />
                <Route path="/admin/certificates" element={<AdminCheck><AdminCertificates /></AdminCheck>} />
                <Route path="/admin/notifications" element={<AdminCheck><AdminNotifications /></AdminCheck>} />
                <Route path="/admin/email-testing" element={<AdminCheck><AdminEmailTesting /></AdminCheck>} />

                {/* Handle Strategy Report Genie routes with the feature removed page */}
                <Route path="/mt5-report-genie" element={<StrategyReportGeniePage />} />
                <Route path="/strategy-report-genie" element={<StrategyReportGeniePage />} />

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
