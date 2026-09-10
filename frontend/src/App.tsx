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
import MainLayout from "./components/MainLayout";
import AdminStatsPage from "./pages/admin/AdminStatsPage";
import AdminDoctorsPage from "./pages/admin/AdminDoctorsPage";
import AdminSpecialtiesPage from "./pages/admin/AdminSpecialtiesPage";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage";
import SymptomCheckerPage from "./pages/SymptomCheckerPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
      <Route path="/register" element={<MainLayout><RegisterPage /></MainLayout>} />
      <Route path="/doctors" element={<MainLayout><DoctorListPage /></MainLayout>} />
      <Route path="/doctors/:id" element={<MainLayout><DoctorDetailPage /></MainLayout>} />
      <Route path="/symptom-checker" element={<MainLayout><SymptomCheckerPage /></MainLayout>} />
      <Route
        path="/appointments/me"
        element={
          <MainLayout>
            <RequireRole role="PATIENT">
              <MyAppointmentsPage />
            </RequireRole>
          </MainLayout>
        }
      />
      <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
      <Route
        path="/doctor/schedule"
        element={
          <MainLayout>
            <RequireRole role="DOCTOR">
              <DoctorSchedulePage />
            </RequireRole>
          </MainLayout>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <MainLayout>
            <RequireRole role="DOCTOR">
              <DoctorAppointmentsPage />
            </RequireRole>
          </MainLayout>
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
