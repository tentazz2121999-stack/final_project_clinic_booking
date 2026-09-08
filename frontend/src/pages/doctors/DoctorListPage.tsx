import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  MenuItem,
  Pagination,
  CircularProgress,
} from "@mui/material";
import doctorService from "../../api/doctorService";
import specialtyService from "../../api/specialtyService";
import { Doctor, Meta, Specialty } from "../../types/doctor";

export default function DoctorListPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtyId, setSpecialtyId] = useState("");
  const [page, setPage] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    specialtyService.getAll().then(({ data }) => setSpecialties(data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    doctorService
      .list({ specialtyId: specialtyId || undefined, page, limit: 6 })
      .then(({ data }) => {
        setDoctors(data.items);
        setMeta(data.meta);
      })
      .finally(() => setLoading(false));
  }, [specialtyId, page]);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Tìm bác sĩ
      </Typography>

      <TextField
        select
        label="Chuyên khoa"
        value={specialtyId}
        onChange={(e) => {
          setSpecialtyId(e.target.value);
          setPage(1);
        }}
        sx={{ minWidth: 240, mb: 3 }}
      >
        <MenuItem value="">Tất cả</MenuItem>
        {specialties.map((s) => (
          <MenuItem key={s.id} value={s.id}>
            {s.name}
          </MenuItem>
        ))}
      </TextField>

      {loading ? (
        <CircularProgress />
      ) : doctors.length === 0 ? (
        <Typography color="text.secondary">Không tìm thấy bác sĩ nào.</Typography>
      ) : (
        <Grid container spacing={2}>
          {doctors.map((d) => (
            <Grid size={{ xs: 12, sm: 6 }} key={d.id}>
              <Card
                component={RouterLink}
                to={`/doctors/${d.id}`}
                sx={{ textDecoration: "none", display: "block", height: "100%" }}
              >
                <CardContent>
                  <Typography variant="h6">{d.user.fullName}</Typography>
                  <Chip label={d.specialty.name} size="small" color="primary" sx={{ mt: 1, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {d.experienceYears} năm kinh nghiệm — {Number(d.consultationFee).toLocaleString("vi-VN")}đ/lượt
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination count={meta.totalPages} page={page} onChange={(_e, v) => setPage(v)} />
        </Box>
      )}
    </Box>
  );
}
