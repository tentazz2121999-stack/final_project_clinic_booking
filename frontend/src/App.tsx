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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctors" element={<DoctorListPage />} />
      <Route path="/doctors/:id" element={<DoctorDetailPage />} />
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
    </Routes>
  );
}
