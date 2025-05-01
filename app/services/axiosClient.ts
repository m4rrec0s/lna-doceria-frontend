import axios from "axios";

const urls = [
  "https://lna-doceria-backend.vercel.app",
  "http://localhost:8080",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || urls[0];

const axiosClient = axios.create({
  baseURL: API_URL,
});

export default axiosClient;
