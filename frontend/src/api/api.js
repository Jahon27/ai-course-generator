import axios from "axios";

const api = axios.create({
  baseURL: "http://20.250.32.2:8000",
});

export default api;