import axiosClient from "./axiosClient";

const specialtyService = {
  getAll: () => axiosClient.get("/specialties"),
};

export default specialtyService;
