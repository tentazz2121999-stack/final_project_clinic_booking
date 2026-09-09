import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Alert,
} from "@mui/material";
import appointmentService from "../../api/appointmentService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Appointment, AppointmentStatus } from "../../types/appointment";

const statusMap: Record<AppointmentStatus, { label: string; color: "primary" | "default" | "success" }> = {
  CONFIRMED: { label: "Đã xác nhận", color: "primary" },
  CANCELLED: { label: "Đã hủy", color: "default" },
  COMPLETED: { label: "Đã hoàn thành", color: "success" },
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DoctorAppointmentsPage() {
  const [date, setDate] = useState(todayISO());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const load = () => {
    appointmentService.listMine({ date }).then(({ data }) => setAppointments(data.data));
  };

  useEffect(() => {
    load();
  }, [date]);

  const handleComplete = async (id: number) => {
    setErrorMsg("");
    try {
      await appointmentService.complete(id);
      load();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Cập nhật thất bại"));
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Bệnh nhân trong ngày
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <TextField
        type="date"
        label="Chọn ngày"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ mb: 3 }}
      />

      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Giờ</TableCell>
              <TableCell>Bệnh nhân</TableCell>
              <TableCell>Liên hệ</TableCell>
              <TableCell>Lý do khám</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                    Không có lịch hẹn nào trong ngày này.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {appointments.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  {a.startTime} - {a.endTime}
                </TableCell>
                <TableCell>{a.patient?.fullName}</TableCell>
                <TableCell>
                  {a.patient?.phone}
                  <br />
                  {a.patient?.email}
                </TableCell>
                <TableCell>{a.reason || "-"}</TableCell>
                <TableCell>
                  <Chip size="small" label={statusMap[a.status].label} color={statusMap[a.status].color} />
                </TableCell>
                <TableCell align="right">
                  {a.status === "CONFIRMED" && (
                    <Button size="small" variant="contained" onClick={() => handleComplete(a.id)}>
                      Đánh dấu đã khám
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
