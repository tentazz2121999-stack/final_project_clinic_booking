import axiosClient from "./axiosClient";

interface CreateAppointmentPayload {
  doctorId: number;
  date: string;
  startTime: string;
  reason?: string;
}

const appointmentService = {
  create: (data: CreateAppointmentPayload) => axiosClient.post("/appointments", data),
  listMine: () => axiosClient.get("/appointments/me"),
  cancel: (id: number) => axiosClient.patch(`/appointments/${id}/cancel`),
};

export default appointmentService;
