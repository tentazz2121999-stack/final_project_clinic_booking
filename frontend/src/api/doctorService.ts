import axiosClient from "./axiosClient";

interface ListParams {
  specialtyId?: number | string;
  page?: number;
  limit?: number;
}

const doctorService = {
  list: (params?: ListParams) => axiosClient.get("/doctors", { params }),
  getById: (id: number | string) => axiosClient.get(`/doctors/${id}`),
  getSlots: (id: number | string, date: string) =>
    axiosClient.get(`/doctors/${id}/slots`, { params: { date } }),
  getReviews: (id: number | string) => axiosClient.get(`/doctors/${id}/reviews`),
};

export default doctorService;
