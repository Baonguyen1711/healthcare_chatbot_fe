import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Create an Axios instance with optional token and withCredentials
const createApi = (
  baseURL: string,
  options?: { token?: string; withCredentials?: boolean }
): AxiosInstance => {
  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    withCredentials: options?.withCredentials ?? false,
  });
};

// Generic CRUD functions
export const getAll = async <T>(
  baseURL: string,
  endpoint = "",
  options?: { token?: string; withCredentials?: boolean; params?: any }
): Promise<T[]> => {
  const api = createApi(baseURL, options);
  const response = await api.get<T[]>(endpoint, { params: options?.params });
  return response.data;
};

export const getById = async <T>(
  baseURL: string,
  endpoint: string,
  id: string | number,
  options?: { token?: string; withCredentials?: boolean }
): Promise<AxiosResponse<T>> => {
  const api = createApi(baseURL, options);
  const response = await api.get<T>(`${endpoint}/${id}`);
  return response;
};

export const createItem = async <req, res>(
  baseURL: string,
  endpoint: string,
  data: req,
  options?: { token?: string; withCredentials?: boolean }
): Promise<AxiosResponse<res>> => {
  const api = createApi(baseURL, options);
  const response = await api.post<res>(endpoint, data);
  return response;
};

export const updateItem = async <T>(
  baseURL: string,
  endpoint: string,
  id: string | number,
  data: T,
  options?: { token?: string; withCredentials?: boolean }
): Promise<AxiosResponse<T>> => {
  const api = createApi(baseURL, options);
  const response = await api.put<T>(`${endpoint}/${id}`, data);
  return response;
};

export const deleteItem = async (
  baseURL: string,
  endpoint: string,
  id: string | number,
  options?: { token?: string; withCredentials?: boolean }
): Promise<void> => {
  const api = createApi(baseURL, options);
  await api.delete(`${endpoint}/${id}`);
};
