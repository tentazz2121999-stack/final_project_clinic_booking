import { Box, Typography } from "@mui/material";
import { MonthlyScheduleDay } from "../types/doctor";

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function MonthlyScheduleCalendar({ days }: { days: MonthlyScheduleDay[] }) {
  if (days.length === 0) return null;

  // dayOfWeek trả về từ backend theo chuẩn JS (0=CN..6=T7) -> quy đổi sang cột bắt đầu từ Thứ Hai
  const leadingBlanks = (days[0].dayOfWeek + 6) % 7;

  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1 }}>
        {WEEKDAY_LABELS.map((label) => (
          <Typography key={label} variant="caption" sx={{ textAlign: "center", fontWeight: 700, color: "text.secondary" }}>
            {label}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <Box key={`blank-${i}`} />
        ))}

        {days.map((d) => {
          const dayNumber = Number(d.date.slice(8, 10));
          return (
            <Box
              key={d.date}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 1,
                minHeight: 64,
                bgcolor: d.isWorkingDay ? "background.paper" : "action.hover",
                opacity: d.isWorkingDay ? 1 : 0.6,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {dayNumber}
              </Typography>
              {d.appointmentCount > 0 && (
                <Typography variant="caption" sx={{ display: "block", color: "primary.main" }}>
                  {d.appointmentCount} lịch hẹn
                </Typography>
              )}
              {d.hasBlock && (
                <Typography variant="caption" sx={{ display: "block", color: "error.main" }}>
                  Có chặn giờ
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
