import { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import statsService from "../../api/statsService";
import AdminLayout from "../../components/AdminLayout";
import { StatsOverview } from "../../types/stats";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }} color="primary.main">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatsOverview | null>(null);

  useEffect(() => {
    statsService.overview().then(({ data }) => setStats(data.data));
  }, []);

  return (
    <AdminLayout>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Thống kê tổng quan
      </Typography>

      {!stats ? null : (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Bác sĩ" value={stats.totalDoctors} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Bệnh nhân" value={stats.totalPatients} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Chuyên khoa" value={stats.totalSpecialties} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Lịch hẹn hôm nay" value={stats.appointmentsToday} />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                  Lịch hẹn theo trạng thái (tổng: {stats.totalAppointments})
                </Typography>
                <Table size="small">
                  <TableBody>
                    {Object.entries(stats.appointmentsByStatus).map(([status, count]) => (
                      <TableRow key={status}>
                        <TableCell>{status}</TableCell>
                        <TableCell align="right">{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                  Bác sĩ được đặt nhiều nhất
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Bác sĩ</TableCell>
                      <TableCell>Chuyên khoa</TableCell>
                      <TableCell align="right">Số lịch hẹn</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.topDoctors.map((d) => (
                      <TableRow key={d.doctorId}>
                        <TableCell>{d.fullName}</TableCell>
                        <TableCell>{d.specialty}</TableCell>
                        <TableCell align="right">{d.appointmentCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </AdminLayout>
  );
}
