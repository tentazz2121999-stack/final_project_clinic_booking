import axiosClient from "./axiosClient";

const statsService = {
  overview: () => axiosClient.get("/stats/overview"),
};

export default statsService;
