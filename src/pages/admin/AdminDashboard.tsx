
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { StatCards, CourseEnrollmentChart, WeeklyEngagementChart, QuickTip } from '@/components/admin/dashboard';
import { useDashboardData } from '@/hooks/admin/useDashboardData';

const AdminDashboard = () => {
  const { 
    totalCourses, 
    totalStudents, 
    avgCompletionRate, 
    coursesData, 
    engagementData, 
    isLoading 
  } = useDashboardData();

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <StatCards 
          totalCourses={totalCourses}
          totalStudents={totalStudents}
          avgCompletionRate={avgCompletionRate}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CourseEnrollmentChart 
            data={coursesData} 
            isLoading={isLoading} 
          />
          
          <WeeklyEngagementChart 
            data={engagementData} 
            isLoading={isLoading} 
          />
        </div>
        
        <QuickTip 
          title="Quick Tip" 
          description="Use the sidebar to navigate between different admin sections. You can manage courses, lessons, and user accounts."
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
