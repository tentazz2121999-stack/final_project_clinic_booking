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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Chip,
} from "@mui/material";
import doctorService from "../../api/doctorService";
import specialtyService from "../../api/specialtyService";
import AdminLayout from "../../components/AdminLayout";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Doctor, Specialty } from "../../types/doctor";

const emptyForm = {
  email: "",
  password: "",
  fullName: "",
  phone: "",
  specialtyId: "",
  bio: "",
  experienceYears: "0",
  consultationFee: "0",
  slotDurationMinutes: "30",
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errorMsg, setErrorMsg] = useState("");

  const load = () => doctorService.list({ limit: 100 }).then(({ data }) => setDoctors(data.items));

  useEffect(() => {
    load();
    specialtyService.getAll().then(({ data }) => setSpecialties(data.data));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrorMsg("");
    setOpen(true);
  };

  const openEdit = (doctor: Doctor) => {
    setEditing(doctor);
    setForm({
      email: "",
      password: "",
      fullName: doctor.user.fullName,
      phone: doctor.user.phone || "",
      specialtyId: String(doctor.specialty.id),
      bio: doctor.bio || "",
      experienceYears: String(doctor.experienceYears),
      consultationFee: String(doctor.consultationFee),
      slotDurationMinutes: String(doctor.slotDurationMinutes),
    });
    setErrorMsg("");
    setOpen(true);
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    try {
      if (editing) {
        await doctorService.update(editing.id, {
          fullName: form.fullName,
          phone: form.phone,
          specialtyId: Number(form.specialtyId),
          bio: form.bio,
          experienceYears: Number(form.experienceYears),
          consultationFee: Number(form.consultationFee),
          slotDurationMinutes: Number(form.slotDurationMinutes),
        });
      } else {
        await doctorService.create({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone,
          specialtyId: Number(form.specialtyId),
          bio: form.bio,
          experienceYears: Number(form.experienceYears),
          consultationFee: Number(form.consultationFee),
          slotDurationMinutes: Number(form.slotDurationMinutes),
        });
      }
      setOpen(false);
      load();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Lưu thông tin bác sĩ thất bại"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa bác sĩ này? Hành động này không thể hoàn tác.")) return;
    try {
      await doctorService.remove(id);
      load();
    } catch (err) {
      window.alert(getErrorMessage(err, "Xóa thất bại"));
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Quản lý bác sĩ
        </Typography>
        <Button variant="contained" onClick={openCreate}>
          Thêm bác sĩ
        </Button>
      </Box>

      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Họ tên</TableCell>
              <TableCell>Chuyên khoa</TableCell>
              <TableCell>Kinh nghiệm</TableCell>
              <TableCell>Giá khám</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.user.fullName}</TableCell>
                <TableCell>
                  <Chip size="small" label={d.specialty.name} />
                </TableCell>
                <TableCell>{d.experienceYears} năm</TableCell>
                <TableCell>{Number(d.consultationFee).toLocaleString("vi-VN")}đ</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(d)}>
                    Sửa
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(d.id)}>
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Cập nhật bác sĩ" : "Thêm bác sĩ mới"}</DialogTitle>
        <DialogContent>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Họ tên"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            {!editing && (
              <>
                <TextField
                  label="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <TextField
                  label="Mật khẩu"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </>
            )}
            <TextField
              label="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <TextField
              select
              label="Chuyên khoa"
              value={form.specialtyId}
              onChange={(e) => setForm({ ...form, specialtyId: e.target.value })}
            >
              {specialties.map((s) => (
                <MenuItem value={s.id} key={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Giới thiệu (bio)"
              multiline
              rows={2}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Số năm kinh nghiệm"
                type="number"
                fullWidth
                value={form.experienceYears}
                onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
              />
              <TextField
                label="Giá khám (VND)"
                type="number"
                fullWidth
                value={form.consultationFee}
                onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
              />
              <TextField
                label="Thời gian/slot (phút)"
                type="number"
                fullWidth
                value={form.slotDurationMinutes}
                onChange={(e) => setForm({ ...form, slotDurationMinutes: e.target.value })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
