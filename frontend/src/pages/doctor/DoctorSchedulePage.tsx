import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Divider,
} from "@mui/material";
import doctorService from "../../api/doctorService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { Doctor, TimeBlock, MonthlyScheduleDay } from "../../types/doctor";
import WeeklyScheduleCalendar from "../../components/WeeklyScheduleCalendar";
import MonthlyScheduleCalendar from "../../components/MonthlyScheduleCalendar";

const DAYS = [
  { value: 1, label: "Thứ Hai" },
  { value: 2, label: "Thứ Ba" },
  { value: 3, label: "Thứ Tư" },
  { value: 4, label: "Thứ Năm" },
  { value: 5, label: "Thứ Sáu" },
  { value: 6, label: "Thứ Bảy" },
  { value: 0, label: "Chủ Nhật" },
];

function dayLabel(value: number) {
  return DAYS.find((d) => d.value === value)?.label || String(value);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DoctorSchedulePage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [monthDays, setMonthDays] = useState<MonthlyScheduleDay[]>([]);

  const [newSlot, setNewSlot] = useState({ dayOfWeek: 1, startTime: "08:00", endTime: "12:00" });
  const [newBlock, setNewBlock] = useState({ date: todayISO(), startTime: "08:00", endTime: "09:00", reason: "" });

  const load = async () => {
    const { data } = await doctorService.getMyProfile();
    setDoctor(data.data);
    const { data: blockData } = await doctorService.listBlocks(data.data.id);
    setBlocks(blockData.data);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!doctor) return;
    doctorService
      .getMonthlySchedule(doctor.id, viewYear, viewMonth)
      .then(({ data }) => setMonthDays(data.data.days));
  }, [doctor, viewYear, viewMonth]);

  const goPrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleAddAvailability = async () => {
    if (!doctor) return;
    setErrorMsg("");
    try {
      await doctorService.addAvailability(doctor.id, newSlot);
      load();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Thêm khung giờ thất bại"));
    }
  };

  const handleRemoveAvailability = async (availabilityId: number) => {
    if (!doctor) return;
    await doctorService.removeAvailability(doctor.id, availabilityId);
    load();
  };

  const handleAddBlock = async () => {
    if (!doctor) return;
    setErrorMsg("");
    try {
      await doctorService.addBlock(doctor.id, newBlock);
      load();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Thêm lịch chặn thất bại"));
    }
  };

  const handleRemoveBlock = async (blockId: number) => {
    if (!doctor) return;
    await doctorService.removeBlock(doctor.id, blockId);
    load();
  };

  if (!doctor) return null;

  const availabilities = doctor.availabilities || [];

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Quản lý lịch làm việc
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Lịch làm việc theo tuần
        </Typography>
        <WeeklyScheduleCalendar availabilities={availabilities} />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Lịch làm việc theo tháng
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button size="small" onClick={goPrevMonth}>
              ← Tháng trước
            </Button>
            <Typography variant="body2" sx={{ minWidth: 90, textAlign: "center" }}>
              Tháng {viewMonth}/{viewYear}
            </Typography>
            <Button size="small" onClick={goNextMonth}>
              Tháng sau →
            </Button>
          </Box>
        </Box>
        <MonthlyScheduleCalendar days={monthDays} />
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }} variant="outlined">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Khung giờ làm việc hàng tuần
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
              <TextField
                select
                label="Thứ"
                value={newSlot.dayOfWeek}
                onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: Number(e.target.value) })}
                sx={{ width: 130 }}
              >
                {DAYS.map((d) => (
                  <MenuItem value={d.value} key={d.value}>
                    {d.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="time"
                label="Từ"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: 130 }}
              />
              <TextField
                type="time"
                label="Đến"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: 130 }}
              />
              <Button variant="contained" onClick={handleAddAvailability}>
                Thêm
              </Button>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Thứ</TableCell>
                  <TableCell>Từ</TableCell>
                  <TableCell>Đến</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {[...availabilities]
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                  .map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{dayLabel(a.dayOfWeek)}</TableCell>
                      <TableCell>{a.startTime}</TableCell>
                      <TableCell>{a.endTime}</TableCell>
                      <TableCell align="right">
                        <Button size="small" color="error" onClick={() => handleRemoveAvailability(a.id)}>
                          Xóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }} variant="outlined">
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Chặn giờ nghỉ đột xuất
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
              <TextField
                type="date"
                label="Ngày"
                value={newBlock.date}
                onChange={(e) => setNewBlock({ ...newBlock, date: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  type="time"
                  label="Từ"
                  value={newBlock.startTime}
                  onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
                <TextField
                  type="time"
                  label="Đến"
                  value={newBlock.endTime}
                  onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
              </Box>
              <TextField
                label="Lý do (không bắt buộc)"
                value={newBlock.reason}
                onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
              />
              <Button variant="contained" onClick={handleAddBlock}>
                Chặn khung giờ này
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Giờ</TableCell>
                  <TableCell>Lý do</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {blocks.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{new Date(b.date).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell>
                      {b.startTime} - {b.endTime}
                    </TableCell>
                    <TableCell>{b.reason}</TableCell>
                    <TableCell align="right">
                      <Button size="small" color="error" onClick={() => handleRemoveBlock(b.id)}>
                        Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
