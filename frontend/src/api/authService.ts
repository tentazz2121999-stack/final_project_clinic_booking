import axiosClient from "./axiosClient";
import { LoginPayload, RegisterPayload } from "../types/auth";

const authService = {
  register: (payload: RegisterPayload) => axiosClient.post("/auth/register", payload),
  login: (payload: LoginPayload) => axiosClient.post("/auth/login", payload),
  logout: () => axiosClient.post("/auth/logout"),
};

export default authService;
