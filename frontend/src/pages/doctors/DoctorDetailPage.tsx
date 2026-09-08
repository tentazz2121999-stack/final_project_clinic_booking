import { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
  Link,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import doctorService from "../../api/doctorService";
import appointmentService from "../../api/appointmentService";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Doctor, Slot } from "../../types/doctor";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    doctorService
      .getById(id!)
      .then(({ data }) => setDoctor(data.data))
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    doctorService
      .getSlots(id!, date)
      .then(({ data }) => setSlots(data.data.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [id, date]);

  const handleBook = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }
    if (user.role !== "PATIENT") {
      setErrorMsg("Chỉ tài khoản bệnh nhân mới có thể đặt lịch khám.");
      return;
    }
    if (!selectedSlot) {
      setErrorMsg("Vui lòng chọn một khung giờ khám.");
      return;
    }

    setSubmitting(true);
    try {
      await appointmentService.create({ doctorId: Number(id), date, startTime: selectedSlot, reason });
      setSuccessMsg("Đặt lịch thành công!");
      setSelectedSlot(null);
      setReason("");
      const { data } = await doctorService.getSlots(id!, date);
      setSlots(data.data.slots);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Đặt lịch thất bại, vui lòng thử lại."));
    } finally {
      setSubmitting(false);
    }
  };

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
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
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
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 4 }} elevation={3}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Đặt lịch khám
            </Typography>

            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Alert>
            )}
            {successMsg && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMsg}
              </Alert>
            )}

            <TextField
              type="date"
              label="Chọn ngày khám"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              slotProps={{ htmlInput: { min: todayISO() }, inputLabel: { shrink: true } }}
              sx={{ mb: 2 }}
            />

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Khung giờ trống
            </Typography>

            {loadingSlots ? (
              <CircularProgress size={24} />
            ) : slots.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Bác sĩ không có lịch trống vào ngày này. Vui lòng chọn ngày khác.
              </Alert>
            ) : (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                {slots.map((slot) => (
                  <Chip
                    key={slot.startTime}
                    label={slot.startTime}
                    clickable
                    color={selectedSlot === slot.startTime ? "primary" : "default"}
                    onClick={() => setSelectedSlot(slot.startTime)}
                  />
                ))}
              </Box>
            )}

            <TextField
              label="Lý do khám (không bắt buộc)"
              fullWidth
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting || slots.length === 0}
              onClick={handleBook}
            >
              {submitting ? "Đang đặt lịch..." : "Xác nhận đặt lịch"}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
