
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const AdminCourses = () => {
  // This component now just redirects to the CourseManagement page
  return <Navigate to="/admin/courses" replace />;
};

export default AdminCourses;
