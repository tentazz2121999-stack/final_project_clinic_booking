import * as yup from "yup";

export const createDoctorSchema = yup.object({
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup.string().min(6, "Mật khẩu tối thiểu 6 ký tự").required("Mật khẩu là bắt buộc"),
  fullName: yup.string().required("Họ tên là bắt buộc"),
  phone: yup.string().nullable(),
  specialtyId: yup.number().integer().required("Chuyên khoa là bắt buộc"),
  bio: yup.string().nullable(),
  experienceYears: yup.number().integer().min(0).default(0),
  consultationFee: yup.number().min(0).default(0),
  slotDurationMinutes: yup.number().integer().min(5).default(30),
});

export const updateDoctorSchema = yup.object({
  fullName: yup.string(),
  phone: yup.string().nullable(),
  specialtyId: yup.number().integer(),
  bio: yup.string().nullable(),
  experienceYears: yup.number().integer().min(0),
  consultationFee: yup.number().min(0),
  slotDurationMinutes: yup.number().integer().min(5),
});

export const availabilitySchema = yup.object({
  dayOfWeek: yup.number().integer().min(0).max(6).required(),
  startTime: yup
    .string()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Định dạng giờ phải là HH:mm")
    .required(),
  endTime: yup
    .string()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Định dạng giờ phải là HH:mm")
    .required(),
});

export const timeBlockSchema = yup.object({
  date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải có định dạng YYYY-MM-DD")
    .required("Ngày là bắt buộc"),
  startTime: yup
    .string()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Định dạng giờ phải là HH:mm")
    .required(),
  endTime: yup
    .string()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Định dạng giờ phải là HH:mm")
    .required(),
  reason: yup.string().nullable(),
});
