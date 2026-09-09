import axiosClient from "./axiosClient";

interface CreateAppointmentPayload {
  doctorId: number;
  date: string;
  startTime: string;
  reason?: string;
}

interface ReviewPayload {
  rating: number;
  comment?: string;
}

interface ListMineParams {
  date?: string;
  status?: string;
}

const appointmentService = {
  create: (data: CreateAppointmentPayload) => axiosClient.post("/appointments", data),
  listMine: (params?: ListMineParams) => axiosClient.get("/appointments/me", { params }),
  cancel: (id: number) => axiosClient.patch(`/appointments/${id}/cancel`),
  complete: (id: number) => axiosClient.patch(`/appointments/${id}/complete`),
  review: (id: number, data: ReviewPayload) => axiosClient.post(`/appointments/${id}/review`, data),
};

export default appointmentService;
