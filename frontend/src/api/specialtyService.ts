import axiosClient from "./axiosClient";

interface SpecialtyPayload {
  name?: string;
  description?: string | null;
}

const specialtyService = {
  getAll: () => axiosClient.get("/specialties"),
  create: (payload: SpecialtyPayload) => axiosClient.post("/specialties", payload),
  update: (id: number, payload: SpecialtyPayload) => axiosClient.put(`/specialties/${id}`, payload),
  remove: (id: number) => axiosClient.delete(`/specialties/${id}`),
};

export default specialtyService;
