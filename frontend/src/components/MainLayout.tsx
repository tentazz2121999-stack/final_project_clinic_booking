import { ReactNode } from "react";
import { NavLink, Link as RouterLink, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Stack, Box, Container } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinkSx = {
    color: "inherit",
    "&.active": { fontWeight: 700, borderBottom: "2px solid", borderColor: "secondary.main" },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ gap: 1, flexWrap: "wrap" }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: "inherit", textDecoration: "none", fontWeight: 700, mr: 2 }}
          >
            Clinic Booking
          </Typography>

          <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1, flexWrap: "wrap" }}>
            <Button component={NavLink} to="/doctors" sx={navLinkSx}>
              Tìm bác sĩ
            </Button>
            <Button component={NavLink} to="/symptom-checker" sx={navLinkSx}>
              Gợi ý chuyên khoa (AI)
            </Button>
            {isAuthenticated && user?.role === "PATIENT" && (
              <Button component={NavLink} to="/appointments/me" sx={navLinkSx}>
                Lịch hẹn của tôi
              </Button>
            )}
            {isAuthenticated && user?.role === "DOCTOR" && (
              <>
                <Button component={NavLink} to="/doctor/schedule" sx={navLinkSx}>
                  Lịch làm việc
                </Button>
                <Button component={NavLink} to="/doctor/appointments" sx={navLinkSx}>
                  Bệnh nhân trong ngày
                </Button>
              </>
            )}
            {isAuthenticated && user?.role === "ADMIN" && (
              <Button component={NavLink} to="/admin" sx={navLinkSx}>
                Trang quản trị
              </Button>
            )}
          </Stack>

          {isAuthenticated && user ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Button component={RouterLink} to="/profile" sx={navLinkSx}>
                {user.fullName}
              </Button>
              <Button variant="outlined" color="inherit" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button color="inherit" component={RouterLink} to="/login">
                Đăng nhập
              </Button>
              <Button variant="contained" color="secondary" component={RouterLink} to="/register">
                Đăng ký
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
