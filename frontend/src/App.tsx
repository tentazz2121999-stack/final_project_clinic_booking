import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DoctorListPage from "./pages/doctors/DoctorListPage";
import DoctorDetailPage from "./pages/doctors/DoctorDetailPage";
import MyAppointmentsPage from "./pages/appointments/MyAppointmentsPage";
import ProfilePage from "./pages/ProfilePage";
import DoctorSchedulePage from "./pages/doctor/DoctorSchedulePage";
import DoctorAppointmentsPage from "./pages/doctor/DoctorAppointmentsPage";
import RequireRole from "./components/RequireRole";
import AdminStatsPage from "./pages/admin/AdminStatsPage";
import AdminDoctorsPage from "./pages/admin/AdminDoctorsPage";
import AdminSpecialtiesPage from "./pages/admin/AdminSpecialtiesPage";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage";
import SymptomCheckerPage from "./pages/SymptomCheckerPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctors" element={<DoctorListPage />} />
      <Route path="/doctors/:id" element={<DoctorDetailPage />} />
      <Route path="/symptom-checker" element={<SymptomCheckerPage />} />
      <Route
        path="/appointments/me"
        element={
          <RequireRole role="PATIENT">
            <MyAppointmentsPage />
          </RequireRole>
        }
      />
      <Route path="/profile" element={<ProfilePage />} />
      <Route
        path="/doctor/schedule"
        element={
          <RequireRole role="DOCTOR">
            <DoctorSchedulePage />
          </RequireRole>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <RequireRole role="DOCTOR">
            <DoctorAppointmentsPage />
          </RequireRole>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireRole role="ADMIN">
            <AdminStatsPage />
          </RequireRole>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <RequireRole role="ADMIN">
            <AdminDoctorsPage />
          </RequireRole>
        }
      />
      <Route
        path="/admin/specialties"
        element={
          <RequireRole role="ADMIN">
            <AdminSpecialtiesPage />
          </RequireRole>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <RequireRole role="ADMIN">
            <AdminAppointmentsPage />
          </RequireRole>
        }
      />
    </Routes>
  );
}
