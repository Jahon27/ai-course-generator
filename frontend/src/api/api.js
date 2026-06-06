import axios from "axios";

const api = axios.create({
  baseURL: "http://20.250.144.167:8000",
});

export default api;