import axiosClient from "./axiosClient";

const doctorService = {
  list: (params) => axiosClient.get("/doctors", { params }),
  getById: (id) => axiosClient.get(`/doctors/${id}`),
  getSlots: (id, date) => axiosClient.get(`/doctors/${id}/slots`, { params: { date } }),
};

export default doctorService;
