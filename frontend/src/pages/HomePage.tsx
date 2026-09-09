import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Stack, Paper } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <Paper sx={{ p: 4, width: 420, textAlign: "center" }} elevation={3}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Clinic Booking
        </Typography>

        {isAuthenticated && user ? (
          <>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Xin chào, <b>{user.fullName}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              ({user.email} — vai trò: {user.role})
            </Typography>
            <Stack direction="row" spacing={2} sx={{ justifyContent: "center", flexWrap: "wrap" }}>
              <Button variant="contained" onClick={() => navigate("/doctors")}>
                Tìm bác sĩ
              </Button>
              <Button variant="outlined" onClick={() => navigate("/profile")}>
                Hồ sơ của tôi
              </Button>
              {user.role === "PATIENT" && (
                <Button variant="outlined" onClick={() => navigate("/appointments/me")}>
                  Lịch hẹn của tôi
                </Button>
              )}
              {user.role === "DOCTOR" && (
                <>
                  <Button variant="outlined" onClick={() => navigate("/doctor/schedule")}>
                    Lịch làm việc
                  </Button>
                  <Button variant="outlined" onClick={() => navigate("/doctor/appointments")}>
                    Bệnh nhân trong ngày
                  </Button>
                </>
              )}
              <Button variant="outlined" color="error" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Bạn chưa đăng nhập.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ justifyContent: "center", flexWrap: "wrap" }}>
              <Button variant="contained" onClick={() => navigate("/login")}>
                Đăng nhập
              </Button>
              <Button variant="outlined" onClick={() => navigate("/register")}>
                Đăng ký
              </Button>
              <Button variant="text" onClick={() => navigate("/doctors")}>
                Tìm bác sĩ
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
}
