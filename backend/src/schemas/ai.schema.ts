import * as yup from "yup";

export const suggestSpecialtySchema = yup.object({
  symptoms: yup
    .string()
    .min(3, "Vui lòng mô tả triệu chứng chi tiết hơn")
    .required("Vui lòng nhập mô tả triệu chứng"),
});
