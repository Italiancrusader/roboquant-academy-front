import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminCheck from "@/components/admin/AdminCheck";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseLesson from "./pages/CourseLesson";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import MT5ReportGenie from "./pages/MT5ReportGenie";

// Admin Routes
import AdminDashboard from "./pages/admin/AdminDashboard";
import CourseManagement from "./pages/admin/CourseManagement";
import LessonManagement from "./pages/admin/LessonManagement";
import AllLessonsManagement from "./pages/admin/AllLessonsManagement"; // New import
import UserManagement from "./pages/admin/UserManagement";

const App = () => {
  // Create a client inside the component to ensure React hooks work properly
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route 
                path="/courses/:courseId/lessons/:lessonId" 
                element={
                  <ProtectedRoute>
                    <CourseLesson />
                  </ProtectedRoute>
                } 
              />
              <Route path="/mt5-report-genie" element={<MT5ReportGenie />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminCheck>
                    <AdminDashboard />
                  </AdminCheck>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <AdminCheck>
                    <CourseManagement />
                  </AdminCheck>
                }
              />
              <Route
                path="/admin/courses/:courseId/lessons"
                element={
                  <AdminCheck>
                    <LessonManagement />
                  </AdminCheck>
                }
              />
              <Route
                path="/admin/lessons"
                element={
                  <AdminCheck>
                    <AllLessonsManagement />
                  </AdminCheck>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminCheck>
                    <UserManagement />
                  </AdminCheck>
                }
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
