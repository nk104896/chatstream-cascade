import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";

// Base API URL - update with your backend URL
// This will work for both development and production environments
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function useApi() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      "Authorization": token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };
  }, []);

  const handleApiError = useCallback((error: any) => {
    console.error("API Error:", error);
    const errorMessage = error.response?.data?.detail || error.message || "An error occurred";
    
    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage,
    });
    
    return Promise.reject(error);
  }, [toast]);

  const fetchData = useCallback(async (
    endpoint: string, 
    options: RequestInit = {}
  ) => {
    setIsLoading(true);
    console.log(`Fetching from: ${API_BASE_URL}${endpoint}`);
    
    try {
      const headers = {
        ...getAuthHeaders(),
        ...options.headers,
      };
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }
      
      const data = await response.json().catch(() => ({}));
      return data;
    } catch (error) {
      return handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, handleApiError]);

  const get = useCallback((endpoint: string) => {
    return fetchData(endpoint, { method: "GET" });
  }, [fetchData]);

  const post = useCallback((endpoint: string, data: any) => {
    return fetchData(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }, [fetchData]);

  const put = useCallback((endpoint: string, data: any) => {
    return fetchData(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }, [fetchData]);

  const del = useCallback((endpoint: string) => {
    return fetchData(endpoint, { method: "DELETE" });
  }, [fetchData]);

  const uploadFiles = useCallback(async (files: File[]) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("files", file);
      });
      
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError]);

  return {
    get,
    post,
    put,
    delete: del,
    uploadFiles,
    isLoading,
  };
}
