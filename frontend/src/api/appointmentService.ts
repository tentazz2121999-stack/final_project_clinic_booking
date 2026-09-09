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

const appointmentService = {
  create: (data: CreateAppointmentPayload) => axiosClient.post("/appointments", data),
  listMine: () => axiosClient.get("/appointments/me"),
  cancel: (id: number) => axiosClient.patch(`/appointments/${id}/cancel`),
  review: (id: number, data: ReviewPayload) => axiosClient.post(`/appointments/${id}/review`, data),
};

export default appointmentService;
