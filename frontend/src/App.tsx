import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DoctorListPage from "./pages/doctors/DoctorListPage";
import DoctorDetailPage from "./pages/doctors/DoctorDetailPage";
import MyAppointmentsPage from "./pages/appointments/MyAppointmentsPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctors" element={<DoctorListPage />} />
      <Route path="/doctors/:id" element={<DoctorDetailPage />} />
      <Route path="/appointments/me" element={<MyAppointmentsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}
