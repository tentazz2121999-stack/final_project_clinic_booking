import * as yup from "yup";

export const updateProfileSchema = yup.object({
  fullName: yup.string().trim().required("Họ tên là bắt buộc"),
  phone: yup.string().trim().nullable(),
  dateOfBirth: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .matches(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Ngày sinh phải có định dạng YYYY-MM-DD",
      excludeEmptyString: true,
    }),
});
