import { Box, Typography } from "@mui/material";
import { Availability } from "../types/doctor";

const DAY_COLUMNS = [
  { value: 1, label: "Thứ Hai" },
  { value: 2, label: "Thứ Ba" },
  { value: 3, label: "Thứ Tư" },
  { value: 4, label: "Thứ Năm" },
  { value: 5, label: "Thứ Sáu" },
  { value: 6, label: "Thứ Bảy" },
  { value: 0, label: "Chủ Nhật" },
];

const HOUR_HEIGHT = 32; // px cho mỗi giờ trên lịch

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export default function WeeklyScheduleCalendar({ availabilities }: { availabilities: Availability[] }) {
  if (availabilities.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Chưa có khung giờ làm việc nào để hiển thị trên lịch.
      </Typography>
    );
  }

  // Xác định khoảng giờ cần vẽ (từ giờ sớm nhất tới muộn nhất, làm tròn ra 2 phía theo giờ tròn)
  const starts = availabilities.map((a) => toMinutes(a.startTime));
  const ends = availabilities.map((a) => toMinutes(a.endTime));
  const rangeStart = Math.floor(Math.min(...starts) / 60) * 60;
  const rangeEnd = Math.ceil(Math.max(...ends) / 60) * 60;
  const totalHours = (rangeEnd - rangeStart) / 60;
  const gridHeight = totalHours * HOUR_HEIGHT;

  const hourMarks = Array.from({ length: totalHours + 1 }, (_, i) => rangeStart + i * 60);

  return (
    <Box sx={{ mb: 3, overflowX: "auto" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "56px repeat(7, minmax(90px, 1fr))", minWidth: 720 }}>
        {/* Header: tên các thứ */}
        <Box />
        {DAY_COLUMNS.map((d) => (
          <Box key={d.value} sx={{ textAlign: "center", pb: 1, fontWeight: 600, fontSize: 13 }}>
            {d.label}
          </Box>
        ))}

        {/* Cột giờ bên trái */}
        <Box sx={{ position: "relative", height: gridHeight }}>
          {hourMarks.map((m) => (
            <Typography
              key={m}
              variant="caption"
              color="text.secondary"
              sx={{
                position: "absolute",
                top: ((m - rangeStart) / 60) * HOUR_HEIGHT - 7,
                right: 6,
              }}
            >
              {String(Math.floor(m / 60)).padStart(2, "0")}:00
            </Typography>
          ))}
        </Box>

        {/* 7 cột ngày */}
        {DAY_COLUMNS.map((d) => {
          const dayAvailabilities = availabilities.filter((a) => a.dayOfWeek === d.value);
          return (
            <Box
              key={d.value}
              sx={{
                position: "relative",
                height: gridHeight,
                borderLeft: "1px solid",
                borderColor: "divider",
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent, transparent " +
                  (HOUR_HEIGHT - 1) +
                  "px, rgba(0,0,0,0.06) " +
                  (HOUR_HEIGHT - 1) +
                  "px, rgba(0,0,0,0.06) " +
                  HOUR_HEIGHT +
                  "px)",
              }}
            >
              {dayAvailabilities.map((a) => {
                const top = ((toMinutes(a.startTime) - rangeStart) / 60) * HOUR_HEIGHT;
                const height = ((toMinutes(a.endTime) - toMinutes(a.startTime)) / 60) * HOUR_HEIGHT;
                return (
                  <Box
                    key={a.id}
                    sx={{
                      position: "absolute",
                      top,
                      height,
                      left: 4,
                      right: 4,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      borderRadius: 1,
                      fontSize: 11,
                      px: 0.5,
                      py: 0.25,
                      overflow: "hidden",
                    }}
                  >
                    {a.startTime}-{a.endTime}
                  </Box>
                );
              })}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
