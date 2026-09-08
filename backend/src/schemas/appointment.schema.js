const yup = require("yup");

const createAppointmentSchema = yup.object({
  doctorId: yup.number().integer().required("Bác sĩ là bắt buộc"),
  date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải có định dạng YYYY-MM-DD")
    .required("Ngày khám là bắt buộc"),
  startTime: yup
    .string()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Định dạng giờ phải là HH:mm")
    .required("Giờ khám là bắt buộc"),
  reason: yup.string().nullable(),
});

module.exports = { createAppointmentSchema };
