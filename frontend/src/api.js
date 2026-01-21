import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getSummary = async () => {
  const response = await api.get("/vehicles/summary");
  return response.data;
};

export const getVehiclesByCounty = async (
  county,
  page = 1,
  perPage = 20,
  modelYear = null,
) => {
  const params = { page, per_page: perPage };
  if (modelYear) params.model_year = modelYear;
  const response = await api.get(
    `/vehicles/county/${encodeURIComponent(county)}`,
    { params },
  );
  return response.data;
};

export const getModelsByMake = async (make) => {
  const response = await api.get(
    `/vehicles/make/${encodeURIComponent(make)}/models`,
  );
  return response.data;
};

export const analyzeVehicles = async (filters, groupBy) => {
  const response = await api.post("/vehicles/analyze", {
    filters,
    group_by: groupBy,
  });
  return response.data;
};

export default api;
