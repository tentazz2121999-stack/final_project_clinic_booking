import axiosClient from "./axiosClient";

interface UpdateProfilePayload {
  fullName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
}

const userService = {
  getMe: () => axiosClient.get("/users/me"),
  updateMe: (payload: UpdateProfilePayload) => axiosClient.put("/users/me", payload),
  searchPatients: (search: string) => axiosClient.get("/users/patients", { params: { search } }),
};

export default userService;
