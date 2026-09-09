import * as yup from "yup";

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
