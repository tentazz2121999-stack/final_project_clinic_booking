import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Box, Paper, Typography, Chip, Avatar, CircularProgress, Link } from "@mui/material";
import doctorService from "../../api/doctorService";

export default function DoctorDetailPage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    doctorService
      .getById(id)
      .then(({ data }) => setDoctor(data.data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, textAlign: "center" }}>
        <Typography color="error">Không tìm thấy bác sĩ.</Typography>
        <Link component={RouterLink} to="/doctors">
          Quay lại danh sách
        </Link>
      </Box>
    );
  }

  if (!doctor) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, px: 2 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 64, height: 64 }}>{doctor.user.fullName.charAt(0)}</Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {doctor.user.fullName}
            </Typography>
            <Chip label={doctor.specialty.name} size="small" color="primary" sx={{ mt: 0.5 }} />
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mb: 1 }}>
          {doctor.bio || "Chưa có thông tin giới thiệu."}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kinh nghiệm: {doctor.experienceYears} năm
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Giá khám: {Number(doctor.consultationFee).toLocaleString("vi-VN")}đ / lượt
        </Typography>

        <Link component={RouterLink} to="/doctors" sx={{ mt: 3, display: "inline-block" }}>
          ← Quay lại danh sách
        </Link>
      </Paper>
    </Box>
  );
}
