import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function RequireRole({ role, children }: { role: string; children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role !== role) {
    return (
      <Box sx={{ maxWidth: 500, mx: "auto", mt: 8, textAlign: "center" }}>
        <Typography color="error">Bạn không có quyền truy cập trang này.</Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
