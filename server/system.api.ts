import axios from "axios";

export const api = axios.create({
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  baseURL:"https://tecopos-test-server.onrender.com"
});

