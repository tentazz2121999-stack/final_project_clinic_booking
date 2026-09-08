import axiosClient from "./axiosClient";

const appointmentService = {
  create: (data) => axiosClient.post("/appointments", data),
};

export default appointmentService;
