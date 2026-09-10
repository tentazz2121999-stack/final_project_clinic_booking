import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Box, AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin", label: "Thống kê" },
  { to: "/admin/doctors", label: "Bác sĩ" },
  { to: "/admin/specialties", label: "Chuyên khoa" },
  { to: "/admin/appointments", label: "Lịch hẹn" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Box>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Quản trị viên
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                end={item.to === "/admin"}
                sx={{
                  "&.active": { fontWeight: 700, borderBottom: "2px solid", borderColor: "primary.main" },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {user?.fullName}
          </Typography>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, px: 2 }}>{children}</Box>
    </Box>
  );
}
