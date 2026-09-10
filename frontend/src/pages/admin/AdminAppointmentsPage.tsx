import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem,
  Button,
  Chip,
  Pagination,
  Alert,
} from "@mui/material";
import appointmentService from "../../api/appointmentService";
import doctorService from "../../api/doctorService";
import AdminLayout from "../../components/AdminLayout";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Appointment, AppointmentStatus } from "../../types/appointment";
import { Doctor, Meta } from "../../types/doctor";

const statusMap: Record<AppointmentStatus, { label: string; color: "primary" | "default" | "success" }> = {
  CONFIRMED: { label: "Đã xác nhận", color: "primary" },
  CANCELLED: { label: "Đã hủy", color: "default" },
  COMPLETED: { label: "Đã khám xong", color: "success" },
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ doctorId: "", status: "", date: "", page: 1 });
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    doctorService.list({ limit: 100 }).then(({ data }) => setDoctors(data.items));
  }, []);

  const load = () => {
    appointmentService
      .listAll({
        doctorId: filters.doctorId || undefined,
        status: filters.status || undefined,
        date: filters.date || undefined,
        page: filters.page,
        limit: 10,
      })
      .then(({ data }) => {
        setAppointments(data.items);
        setMeta(data.meta);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleCancel = async (id: number) => {
    setErrorMsg("");
    try {
      await appointmentService.cancel(id);
      load();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Hủy lịch hẹn thất bại"));
    }
  };

  const updateFilter = (key: string, value: string) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  return (
    <AdminLayout>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Toàn bộ lịch hẹn hệ thống
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          select
          label="Bác sĩ"
          value={filters.doctorId}
          onChange={(e) => updateFilter("doctorId", e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {doctors.map((d) => (
            <MenuItem value={d.id} key={d.id}>
              {d.user.fullName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Trạng thái"
          value={filters.status}
          onChange={(e) => updateFilter("status", e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="CONFIRMED">Đã xác nhận</MenuItem>
          <MenuItem value="CANCELLED">Đã hủy</MenuItem>
          <MenuItem value="COMPLETED">Đã khám xong</MenuItem>
        </TextField>

        <TextField
          type="date"
          label="Ngày"
          value={filters.date}
          onChange={(e) => updateFilter("date", e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>

      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bệnh nhân</TableCell>
              <TableCell>Bác sĩ</TableCell>
              <TableCell>Ngày</TableCell>
              <TableCell>Giờ</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.patient?.fullName}</TableCell>
                <TableCell>{a.doctor.user.fullName}</TableCell>
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
                      Hủy hộ
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={meta.totalPages}
          page={meta.page}
          onChange={(_e, value) => setFilters((f) => ({ ...f, page: value }))}
        />
      </Box>
    </AdminLayout>
  );
}
