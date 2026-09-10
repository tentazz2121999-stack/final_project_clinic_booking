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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import appointmentService from "../../api/appointmentService";
import doctorService from "../../api/doctorService";
import userService from "../../api/userService";
import AdminLayout from "../../components/AdminLayout";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Appointment, AppointmentStatus } from "../../types/appointment";
import { Doctor, Meta, Slot } from "../../types/doctor";

const statusMap: Record<AppointmentStatus, { label: string; color: "primary" | "default" | "success" }> = {
  CONFIRMED: { label: "Đã xác nhận", color: "primary" },
  CANCELLED: { label: "Đã hủy", color: "default" },
  COMPLETED: { label: "Đã khám xong", color: "success" },
};

interface Patient {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ doctorId: "", status: "", date: "", page: 1 });
  const [errorMsg, setErrorMsg] = useState("");

  // Đặt lịch hộ
  const [bookOpen, setBookOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [bookDoctorId, setBookDoctorId] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookSlots, setBookSlots] = useState<Slot[]>([]);
  const [bookSlot, setBookSlot] = useState<string | null>(null);
  const [bookReason, setBookReason] = useState("");
  const [bookErrorMsg, setBookErrorMsg] = useState("");
  const [booking, setBooking] = useState(false);

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

  const openBookDialog = () => {
    setPatientSearch("");
    setPatientResults([]);
    setSelectedPatient(null);
    setBookDoctorId("");
    setBookDate("");
    setBookSlots([]);
    setBookSlot(null);
    setBookReason("");
    setBookErrorMsg("");
    setBookOpen(true);
  };

  useEffect(() => {
    if (patientSearch.trim().length < 2) {
      setPatientResults([]);
      return;
    }
    const timer = setTimeout(() => {
      userService.searchPatients(patientSearch).then(({ data }) => setPatientResults(data.data));
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  useEffect(() => {
    if (!bookDoctorId || !bookDate) {
      setBookSlots([]);
      return;
    }
    setBookSlot(null);
    doctorService.getSlots(bookDoctorId, bookDate).then(({ data }) => setBookSlots(data.data.slots));
  }, [bookDoctorId, bookDate]);

  const handleBookSubmit = async () => {
    setBookErrorMsg("");
    if (!selectedPatient) return setBookErrorMsg("Vui lòng chọn bệnh nhân");
    if (!bookDoctorId || !bookDate || !bookSlot) return setBookErrorMsg("Vui lòng chọn đầy đủ bác sĩ, ngày và giờ khám");

    setBooking(true);
    try {
      await appointmentService.create({
        doctorId: Number(bookDoctorId),
        date: bookDate,
        startTime: bookSlot,
        reason: bookReason || undefined,
        patientId: selectedPatient.id,
      });
      setBookOpen(false);
      load();
    } catch (err) {
      setBookErrorMsg(getErrorMessage(err, "Đặt lịch hộ thất bại"));
    } finally {
      setBooking(false);
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Toàn bộ lịch hẹn hệ thống
        </Typography>
        <Button variant="contained" onClick={openBookDialog}>
          Đặt lịch hộ
        </Button>
      </Box>

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

      <Dialog open={bookOpen} onClose={() => setBookOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đặt lịch hộ (bệnh nhân gọi điện)</DialogTitle>
        <DialogContent>
          {bookErrorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {bookErrorMsg}
            </Alert>
          )}

          {!selectedPatient ? (
            <>
              <TextField
                label="Tìm bệnh nhân theo email hoặc tên"
                fullWidth
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                sx={{ mt: 1, mb: 1 }}
                autoFocus
              />
              <List dense>
                {patientResults.map((p) => (
                  <ListItemButton key={p.id} onClick={() => setSelectedPatient(p)}>
                    <ListItemText primary={p.fullName} secondary={`${p.email}${p.phone ? " — " + p.phone : ""}`} />
                  </ListItemButton>
                ))}
                {patientSearch.trim().length >= 2 && patientResults.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                    Không tìm thấy bệnh nhân phù hợp.
                  </Typography>
                )}
              </List>
            </>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Alert severity="info" sx={{ mb: 2 }} onClose={() => setSelectedPatient(null)}>
                Bệnh nhân: <b>{selectedPatient.fullName}</b> ({selectedPatient.email})
              </Alert>

              <TextField
                select
                label="Bác sĩ"
                fullWidth
                value={bookDoctorId}
                onChange={(e) => setBookDoctorId(e.target.value)}
                sx={{ mb: 2 }}
              >
                {doctors.map((d) => (
                  <MenuItem value={d.id} key={d.id}>
                    {d.user.fullName} — {d.specialty.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                type="date"
                label="Ngày khám"
                fullWidth
                value={bookDate}
                onChange={(e) => setBookDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ mb: 2 }}
              />

              {bookDoctorId && bookDate && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Khung giờ trống:
                  </Typography>
                  {bookSlots.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Không còn khung giờ trống ngày này.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {bookSlots.map((s) => (
                        <Button
                          key={s.startTime}
                          size="small"
                          variant={bookSlot === s.startTime ? "contained" : "outlined"}
                          onClick={() => setBookSlot(s.startTime)}
                        >
                          {s.startTime}
                        </Button>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              <TextField
                label="Lý do khám (không bắt buộc)"
                fullWidth
                value={bookReason}
                onChange={(e) => setBookReason(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleBookSubmit} disabled={booking || !selectedPatient}>
            {booking ? "Đang đặt..." : "Xác nhận đặt lịch"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
