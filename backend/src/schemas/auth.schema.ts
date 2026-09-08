import * as yup from "yup";

export const registerSchema = yup.object({
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup.string().min(6, "Mật khẩu tối thiểu 6 ký tự").required("Mật khẩu là bắt buộc"),
  fullName: yup.string().required("Họ tên là bắt buộc"),
  phone: yup.string().nullable(),

  dateOfBirth: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .matches(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Ngày sinh phải có định dạng YYYY-MM-DD",
      excludeEmptyString: true,
    }),
});

export const loginSchema = yup.object({
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup.string().required("Mật khẩu là bắt buộc"),
});

export const refreshTokenSchema = yup.object({
  refreshToken: yup.string().required("Thiếu refreshToken"),
});
