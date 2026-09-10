import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Paper, Typography, TextField, Button, Alert, List, ListItem, ListItemText } from "@mui/material";
import aiService from "../api/aiService";
import { SuggestSpecialtyResult } from "../types/ai";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState<SuggestSpecialtyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setResult(null);
    setLoading(true);
    try {
      const { data } = await aiService.suggestSpecialty(symptoms);
      setResult(data.data);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Có lỗi xảy ra, vui lòng thử lại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={640} mx="auto">
      <Typography variant="h5" fontWeight={700} mb={1}>
        Gợi ý chuyên khoa từ triệu chứng
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Mô tả triệu chứng bạn đang gặp bằng tiếng Việt (ví dụ: "tôi hay đau đầu và mất ngủ"), AI sẽ gợi ý chuyên
        khoa phù hợp để bạn tìm bác sĩ.
      </Typography>

      <Paper sx={{ p: 3 }} variant="outlined">
        <form onSubmit={handleSubmit}>
          <TextField
            label="Mô tả triệu chứng"
            fullWidth
            multiline
            rows={3}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" disabled={loading || symptoms.trim().length < 3}>
            {loading ? "Đang phân tích..." : "Gợi ý chuyên khoa"}
          </Button>
        </form>
      </Paper>

      {errorMsg && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {result && (
        <Box mt={3}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {result.disclaimer}
          </Alert>

          {result.fallbackMessage ? (
            <Alert severity="info">{result.fallbackMessage}</Alert>
          ) : (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} mb={1}>
                Chuyên khoa được gợi ý:
              </Typography>
              <List>
                {result.suggestions.map((s) => (
                  <ListItem
                    key={s.specialty.id}
                    secondaryAction={
                      <Button
                        component={RouterLink}
                        to={`/doctors?specialtyId=${s.specialty.id}`}
                        size="small"
                        variant="outlined"
                      >
                        Xem bác sĩ
                      </Button>
                    }
                  >
                    <ListItemText primary={s.specialty.name} secondary={s.reason} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
}
