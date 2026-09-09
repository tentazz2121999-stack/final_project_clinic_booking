import axiosClient from "./axiosClient";

interface UpdateProfilePayload {
  fullName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
}

const userService = {
  getMe: () => axiosClient.get("/users/me"),
  updateMe: (payload: UpdateProfilePayload) => axiosClient.put("/users/me", payload),
};

export default userService;
