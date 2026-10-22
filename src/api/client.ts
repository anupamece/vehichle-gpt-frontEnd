import axios from "axios";

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// Response interceptor to extract clean API error messages
client.interceptors.response.use(
  (response) => response,
  (error) => {
    let message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Network connection error to VehicleGPT backend.";

    // Provide explicit descriptive message on client-side or gateway timeout
    if (
      error.code === "ECONNABORTED" ||
      error.message?.toLowerCase().includes("timeout") ||
      error.response?.status === 504
    ) {
      message =
        error.response?.data?.detail ||
        "VehicleGPT query timed out waiting for local model inference. Please verify that the local Ollama daemon is active and responsive.";
    }

    return Promise.reject(new Error(message));
  },
);

export default client;
