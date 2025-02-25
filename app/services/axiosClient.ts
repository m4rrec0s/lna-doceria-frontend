import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://lna-doceria-backend.vercel.app",
});

export default axiosClient;
