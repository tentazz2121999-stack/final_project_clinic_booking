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
  Alert,
} from "@mui/material";
import specialtyService from "../../api/specialtyService";
import AdminLayout from "../../components/AdminLayout";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Specialty } from "../../types/doctor";

const emptyForm = { name: "", description: "" };

export default function AdminSpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Specialty | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errorMsg, setErrorMsg] = useState("");

  const load = () => specialtyService.getAll().then(({ data }) => setSpecialties(data.data));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrorMsg("");
    setOpen(true);
  };

  const openEdit = (specialty: Specialty) => {
    setEditing(specialty);
    setForm({ name: specialty.name, description: specialty.description || "" });
    setErrorMsg("");
    setOpen(true);
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    try {
      if (editing) {
        await specialtyService.update(editing.id, form);
      } else {
        await specialtyService.create(form);
      }
      setOpen(false);
      load();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Lưu chuyên khoa thất bại"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa chuyên khoa này?")) return;
    try {
      await specialtyService.remove(id);
      load();
    } catch (err) {
      window.alert(getErrorMessage(err, "Xóa thất bại"));
    }
  };

  return (
    <AdminLayout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Quản lý chuyên khoa
        </Typography>
        <Button variant="contained" onClick={openCreate}>
          Thêm chuyên khoa
        </Button>
      </Box>

      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên chuyên khoa</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {specialties.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.description}</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(s)}>
                    Sửa
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(s.id)}>
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Cập nhật chuyên khoa" : "Thêm chuyên khoa"}</DialogTitle>
        <DialogContent>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}
          <TextField
            label="Tên chuyên khoa"
            fullWidth
            sx={{ mb: 2, mt: 1 }}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
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
