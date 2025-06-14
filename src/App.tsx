import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/auth/LoginPage';
import Dashboard from '@/pages/Dashboard';
import ApplicationsPage from '@/pages/students/applications/ApplicationsPage';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import all your pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DirectStudents from "./pages/students/DirectStudents";
import AgentStudents from "./pages/students/AgentStudents";
import StudentAdmission from "./pages/students/StudentAdmission";
import AgentManagement from "./pages/agents/AgentManagement";
import Universities from "./pages/universities/Universities";
import UniversityDetail from "./pages/universities/UniversityDetail";
import HostelManagement from "./pages/hostels/HostelManagement";
import HostelExpenses from "./pages/hostels/HostelExpenses";
import MessManagement from "./pages/mess/MessManagement";
import OfficeExpenses from "./pages/office/OfficeExpenses";
import SalaryManagement from "./pages/salary/SalaryManagement";
import PersonalExpenses from "./pages/personal/PersonalExpenses";
import FeesType from "./pages/fees/FeesType";
import FeesMaster from "./pages/fees/FeesMaster";
import CollectFees from "./pages/fees/CollectFees";
import FeeReports from "./pages/fees/FeeReports";
import PaymentHistory from "./pages/fees/PaymentHistory";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";

const queryClient = new QueryClient();

const App = () => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Student Module */}
            <Route
              path="/students/direct"
              element={
                <ProtectedRoute>
                  <DirectStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/agent"
              element={
                <ProtectedRoute>
                  <AgentStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/admission"
              element={
                <ProtectedRoute>
                  <StudentAdmission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/applications"
              element={
                <ProtectedRoute>
                  <ApplicationsPage />
                </ProtectedRoute>
              }
            />

            {/* Agent Management */}
            <Route
              path="/agents"
              element={
                <ProtectedRoute>
                  <AgentManagement />
                </ProtectedRoute>
              }
            />

            {/* University Section */}
            <Route
              path="/universities"
              element={
                <ProtectedRoute>
                  <Universities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/universities/:universityId"
              element={
                <ProtectedRoute>
                  <UniversityDetail />
                </ProtectedRoute>
              }
            />

            {/* Hostel Expenses */}
            <Route
              path="/hostels/management"
              element={
                <ProtectedRoute>
                  <HostelManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hostels/expenses"
              element={
                <ProtectedRoute>
                  <HostelExpenses />
                </ProtectedRoute>
              }
            />

            {/* Mess Management */}
            <Route
              path="/mess/management"
              element={
                <ProtectedRoute>
                  <MessManagement />
                </ProtectedRoute>
              }
            />

            {/* Office Expenses */}
            <Route
              path="/office-expenses"
              element={
                <ProtectedRoute>
                  <OfficeExpenses />
                </ProtectedRoute>
              }
            />

            {/* Salary Management */}
            <Route
              path="/salary"
              element={
                <ProtectedRoute>
                  <SalaryManagement />
                </ProtectedRoute>
              }
            />

            {/* Personal Expenses */}
            <Route
              path="/personal-expenses"
              element={
                <ProtectedRoute>
                  <PersonalExpenses />
                </ProtectedRoute>
              }
            />

            {/* Fees Collection Module */}
            <Route
              path="/fees/types"
              element={
                <ProtectedRoute>
                  <FeesType />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fees/master"
              element={
                <ProtectedRoute>
                  <FeesMaster />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fees/collect"
              element={
                <ProtectedRoute>
                  <CollectFees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fees/reports"
              element={
                <ProtectedRoute>
                  <FeeReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fees/payment-history"
              element={
                <ProtectedRoute>
                  <PaymentHistory />
                </ProtectedRoute>
              }
            />

            {/* Reports Section */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to login */}
            <Route
              path="*"
              element={<Navigate to="/login" replace />}
            />
          </Routes>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
