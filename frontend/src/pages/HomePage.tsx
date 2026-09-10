import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Grid, Card, CardContent, Button, Chip, Paper } from "@mui/material";
import specialtyService from "../api/specialtyService";
import { Specialty } from "../types/doctor";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  useEffect(() => {
    specialtyService.getAll().then(({ data }) => setSpecialties(data.data));
  }, []);

  return (
    <Box>
      <Paper
        sx={{
          p: 5,
          mb: 4,
          background: "linear-gradient(135deg, #1565c0 0%, #00897b 100%)",
          color: "white",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {isAuthenticated && user ? `Xin chào, ${user.fullName}` : "Đặt lịch khám bệnh nhanh chóng, thuận tiện"}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          Tìm bác sĩ theo chuyên khoa phù hợp, xem khung giờ trống theo thời gian thực và đặt lịch chỉ trong vài
          bước.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button component={RouterLink} to="/doctors" variant="contained" color="secondary" size="large">
            Tìm bác sĩ ngay
          </Button>
          <Button
            component={RouterLink}
            to="/symptom-checker"
            variant="outlined"
            size="large"
            sx={{ color: "white", borderColor: "white" }}
          >
            Chưa biết khám gì? Thử gợi ý chuyên khoa (AI)
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Chuyên khoa
      </Typography>
      <Grid container spacing={2}>
        {specialties.map((s) => (
          <Grid key={s.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              variant="outlined"
              component={RouterLink}
              to={`/doctors?specialtyId=${s.id}`}
              sx={{ textDecoration: "none", height: "100%", display: "block" }}
            >
              <CardContent>
                <Chip label={s.name} color="primary" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {s.description || "Xem danh sách bác sĩ thuộc chuyên khoa này"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
