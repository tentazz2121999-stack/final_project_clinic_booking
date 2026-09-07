import axiosClient from "./axiosClient";

const doctorService = {
  list: (params) => axiosClient.get("/doctors", { params }),
  getById: (id) => axiosClient.get(`/doctors/${id}`),
};

export default doctorService;
