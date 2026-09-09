import axiosClient from "./axiosClient";

interface ListParams {
  specialtyId?: number | string;
  page?: number;
  limit?: number;
}

interface AvailabilityPayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface TimeBlockPayload {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

const doctorService = {
  list: (params?: ListParams) => axiosClient.get("/doctors", { params }),
  getById: (id: number | string) => axiosClient.get(`/doctors/${id}`),
  getSlots: (id: number | string, date: string) =>
    axiosClient.get(`/doctors/${id}/slots`, { params: { date } }),
  getReviews: (id: number | string) => axiosClient.get(`/doctors/${id}/reviews`),
  getMyProfile: () => axiosClient.get("/doctors/me/profile"),
  addAvailability: (doctorId: number, data: AvailabilityPayload) =>
    axiosClient.post(`/doctors/${doctorId}/availability`, data),
  removeAvailability: (doctorId: number, availabilityId: number) =>
    axiosClient.delete(`/doctors/${doctorId}/availability/${availabilityId}`),
  listBlocks: (doctorId: number) => axiosClient.get(`/doctors/${doctorId}/blocks`),
  addBlock: (doctorId: number, data: TimeBlockPayload) => axiosClient.post(`/doctors/${doctorId}/blocks`, data),
  removeBlock: (doctorId: number, blockId: number) => axiosClient.delete(`/doctors/${doctorId}/blocks/${blockId}`),
};

export default doctorService;
