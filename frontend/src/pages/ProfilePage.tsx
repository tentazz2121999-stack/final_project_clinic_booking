import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { Box, Paper, TextField, Typography, Button, Alert, Stack } from "@mui/material";
import userService from "../api/userService";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/getErrorMessage";

const schema = yup.object({
  fullName: yup.string().required("Vui lòng nhập họ tên"),
  phone: yup.string().nullable(),
  dateOfBirth: yup.string().nullable(),
});

type FormValues = yup.InferType<typeof schema>;

function toDateInputValue(isoString: string | null | undefined) {
  if (!isoString) return "";
  return isoString.slice(0, 10);
}

export default function ProfilePage() {
  const { isAuthenticated, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    userService
      .getMe()
      .then(({ data }) => {
        const me = data.data;
        reset({
          fullName: me.fullName || "",
          phone: me.phone || "",
          dateOfBirth: toDateInputValue(me.dateOfBirth),
        });
      })
      .catch(() => setErrorMsg("Không tải được thông tin hồ sơ"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, reset]);

  const onSubmit = async (values: FormValues) => {
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      const { data } = await userService.updateMe({
        fullName: values.fullName,
        phone: values.phone || null,
        dateOfBirth: values.dateOfBirth || null,
      });
      updateUser(data.data);
      setSuccessMsg("Cập nhật hồ sơ thành công!");
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Cập nhật hồ sơ thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
      <Paper sx={{ p: 4, width: 480 }} elevation={3}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: "center" }}>
          Hồ sơ của tôi
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
          Cập nhật thông tin cá nhân của bạn
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField label="Email" fullWidth value={user?.email || ""} disabled />
            <TextField
              label="Họ và tên"
              fullWidth
              {...register("fullName")}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />
            <TextField label="Số điện thoại" fullWidth {...register("phone")} />
            <TextField
              label="Ngày sinh"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              {...register("dateOfBirth")}
            />
            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
