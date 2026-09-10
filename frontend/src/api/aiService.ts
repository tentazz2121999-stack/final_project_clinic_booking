import axiosClient from "./axiosClient";

const aiService = {
  suggestSpecialty: (symptoms: string) => axiosClient.post("/ai/suggest-specialty", { symptoms }),
};

export default aiService;
