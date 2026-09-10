import * as yup from "yup";

export const createSpecialtySchema = yup.object({
  name: yup.string().required("Tên chuyên khoa là bắt buộc"),
  description: yup.string().nullable(),
});

export const updateSpecialtySchema = yup.object({
  name: yup.string(),
  description: yup.string().nullable(),
});
