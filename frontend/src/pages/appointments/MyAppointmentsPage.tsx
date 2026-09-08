import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Chip,
  Alert,
} from "@mui/material";
import appointmentService from "../../api/appointmentService";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Appointment, AppointmentStatus } from "../../types/appointment";

const statusMap: Record<AppointmentStatus, { label: string; color: "primary" | "default" | "success" }> = {
  CONFIRMED: { label: "Đã xác nhận", color: "primary" },
  CANCELLED: { label: "Đã hủy", color: "default" },
  COMPLETED: { label: "Đã hoàn thành", color: "success" },
};

export default function MyAppointmentsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const load = () => {
    appointmentService.listMine().then(({ data }) => setAppointments(data.items));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    load();
  }, [isAuthenticated]);

  const handleCancel = async (id: number) => {
    setErrorMsg("");
    try {
      await appointmentService.cancel(id);
      load();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Hủy lịch hẹn thất bại"));
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Lịch hẹn của tôi
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bác sĩ</TableCell>
              <TableCell>Chuyên khoa</TableCell>
              <TableCell>Ngày</TableCell>
              <TableCell>Giờ</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                    Bạn chưa có lịch hẹn nào.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {appointments.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.doctor.user.fullName}</TableCell>
                <TableCell>{a.doctor.specialty.name}</TableCell>
                <TableCell>{new Date(a.date).toLocaleDateString("vi-VN")}</TableCell>
                <TableCell>
                  {a.startTime} - {a.endTime}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={statusMap[a.status].label} color={statusMap[a.status].color} />
                </TableCell>
                <TableCell align="right">
                  {a.status === "CONFIRMED" && (
                    <Button size="small" color="error" onClick={() => handleCancel(a.id)}>
                      Hủy lịch
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
