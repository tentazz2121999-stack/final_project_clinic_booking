-- DropIndex
DROP INDEX "appointments_doctorId_date_startTime_key";

-- Chỉ chặn trùng lịch với các lịch hẹn CHƯA bị hủy — lịch đã CANCELLED không còn "chiếm chỗ"
-- (dòng cũ, hủy vẫn giữ lại để lưu lịch sử, nhưng không chặn đặt lại đúng khung giờ đó nữa).
CREATE UNIQUE INDEX "appointments_doctorId_date_startTime_active_key"
ON "appointments"("doctorId", "date", "startTime")
WHERE "status" != 'CANCELLED';
