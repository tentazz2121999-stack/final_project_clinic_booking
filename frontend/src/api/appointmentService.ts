import axiosClient from "./axiosClient";

interface CreateAppointmentPayload {
  doctorId: number;
  date: string;
  startTime: string;
  reason?: string;
  patientId?: number;
}

interface ReviewPayload {
  rating: number;
  comment?: string;
}

interface ListMineParams {
  date?: string;
  status?: string;
}

interface ListAllParams {
  doctorId?: number | string;
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}

const appointmentService = {
  create: (data: CreateAppointmentPayload) => axiosClient.post("/appointments", data),
  listMine: (params?: ListMineParams) => axiosClient.get("/appointments/me", { params }),
  listAll: (params?: ListAllParams) => axiosClient.get("/appointments", { params }),
  cancel: (id: number) => axiosClient.patch(`/appointments/${id}/cancel`),
  complete: (id: number) => axiosClient.patch(`/appointments/${id}/complete`),
  review: (id: number, data: ReviewPayload) => axiosClient.post(`/appointments/${id}/review`, data),
};

export default appointmentService;
