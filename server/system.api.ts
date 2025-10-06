import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const api = axios.create({
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
});

export async function initializeApi() {
  try {
    const base = await AsyncStorage.getItem('baseURL');
    if (base) {
      api.defaults.baseURL = base;
    } else {
      throw new Error("No se pudo cargar la url del servidor");
    }
  } catch (error) {
    console.error("Failed to initialize API:", error);
    throw error;
  }
}

api.interceptors.request.use(
  async (config) => {
    if (!api.defaults.baseURL) {
      try {
        await initializeApi();
      } catch {
        return Promise.reject(new Error("API no inicializada - URL base no configurada"));
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

