import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.10.151:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
//baseURL: "http://172.16.2.9:3000/api",
