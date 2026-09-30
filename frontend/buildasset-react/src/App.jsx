import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/layout/Layout";

// Public Pages
import LandingPage from "./pages/public/LandingPage";

// Auth Pages
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";

// Dashboard Page
import Dashboard from "./pages/dashboard/Dashboard";

// Contractor Pages
import ContractorList from "./pages/contractors/ContractorList";

// Equipment Pages
import EquipmentList from "./pages/equipment/EquipmentList";
import AddEquipment from "./pages/equipment/AddEquipment";
import EquipmentDetails from "./pages/equipment/EquipmentDetails";
import EditEquipment from "./pages/equipment/EditEquipment";

// Rental Pages
import RentalList from "./pages/rentals/RentalList";
import BookRental from "./pages/rentals/BookRental";
import RentalDetails from "./pages/rentals/RentalDetails";

// Dispatch Pages
import DispatchBoard from "./pages/dispatch/DispatchBoard";
import CreateDispatch from "./pages/dispatch/CreateDispatch";
import DispatchDetails from "./pages/dispatch/DispatchDetails";

// Maintenance, Profile & System
import MaintenanceBoard from "./pages/maintenance/MaintenanceBoard";
import Profile from "./pages/profile/Profile";
import SystemStatus from "./pages/system/SystemStatus";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Authentication Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes wrapped in Enterprise Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Contractors (ADMIN only) */}
              <Route
                path="/contractors"
                element={
                  <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                    <ContractorList />
                  </ProtectedRoute>
                }
              />

              {/* Equipment Fleet */}
              <Route path="/equipment" element={<EquipmentList />} />
              <Route
                path="/equipment/add"
                element={
                  <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                    <AddEquipment />
                  </ProtectedRoute>
                }
              />
              <Route path="/equipment/:id" element={<EquipmentDetails />} />
              <Route
                path="/equipment/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                    <EditEquipment />
                  </ProtectedRoute>
                }
              />

              {/* Rentals */}
              <Route path="/rentals" element={<RentalList />} />
              <Route
                path="/rentals/book"
                element={
                  <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_CONTRACTOR"]}>
                    <BookRental />
                  </ProtectedRoute>
                }
              />
              <Route path="/rentals/:id" element={<RentalDetails />} />

              {/* Dispatch Board */}
              <Route path="/dispatch" element={<DispatchBoard />} />
              <Route
                path="/dispatch/create"
                element={
                  <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_OPERATOR"]}>
                    <CreateDispatch />
                  </ProtectedRoute>
                }
              />
              <Route path="/dispatch/:id" element={<DispatchDetails />} />

              {/* Maintenance (ADMIN and OPERATOR only) */}
              <Route
                path="/maintenance"
                element={
                  <ProtectedRoute allowedRoles={["ROLE_ADMIN", "ROLE_OPERATOR"]}>
                    <MaintenanceBoard />
                  </ProtectedRoute>
                }
              />

              {/* Profile */}
              <Route path="/profile" element={<Profile />} />

              {/* System Status & Gateway (ADMIN only) */}
              <Route
                path="/system"
                element={
                  <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                    <SystemStatus />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
