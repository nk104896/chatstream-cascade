
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";

// The base URL for our API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function useApi() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Gets the authentication headers for API requests
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    // Create base headers object
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // Only add Authorization header if we have a token
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    return headers;
  }, []);

  // Shows error messages to the user
  const showErrorToast = useCallback((error: any) => {
    console.error("API Error:", error);
    
    // Get the error message from the response or use a default
    const errorMessage = error.response?.data?.detail || 
                         error.message || 
                         "An error occurred";
    
    // Show the error to the user
    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage,
    });
    
    return Promise.reject(error);
  }, [toast]);

  // Main function to make API requests
  const makeApiRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    // Show loading state
    setIsLoading(true);
    console.log(`Making request to: ${API_BASE_URL}${endpoint}`);
    
    try {
      // Combine default headers with any custom headers
      const headers = {
        ...getAuthHeaders(),
        ...(options.headers as Record<string, string> || {}),
      };

      console.log('Request headers:', headers); // Debug log
      
      // Make the API call
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      
      // Handle non-success responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }
      
      // Parse and return the response data
      const data = await response.json().catch(() => ({}));
      return data;
    } catch (error) {
      return showErrorToast(error);
    } finally {
      // Hide loading state when done
      setIsLoading(false);
    }
  }, [getAuthHeaders, showErrorToast]);

  // Simple GET request
  const get = useCallback((endpoint: string) => {
    return makeApiRequest(endpoint, { method: "GET" });
  }, [makeApiRequest]);

  // POST request with JSON data
  const post = useCallback((endpoint: string, data: any) => {
    return makeApiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }, [makeApiRequest]);

  // PUT request with JSON data
  const put = useCallback((endpoint: string, data: any) => {
    return makeApiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }, [makeApiRequest]);

  // DELETE request
  const deleteRequest = useCallback((endpoint: string) => {
    return makeApiRequest(endpoint, { method: "DELETE" });
  }, [makeApiRequest]);

  // Special function for uploading files
  const uploadFiles = useCallback(async (files: File[]) => {
    setIsLoading(true);
    
    try {
      // Create FormData to hold the files
      const formData = new FormData();
      files.forEach(file => {
        formData.append("files", file);
      });
      
      // Get auth headers but remove Content-Type
      // (browser will set it automatically for FormData)
      const headers = getAuthHeaders();
      delete headers["Content-Type"];
      
      // Upload the files
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers,
        body: formData,
      });
      
      // Handle errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload error: ${response.status}`);
      }
      
      // Return the response data
      const data = await response.json();
      return data;
    } catch (error) {
      return showErrorToast(error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, showErrorToast]);

  // Return the API functions
  return {
    get,
    post,
    put,
    delete: deleteRequest,
    uploadFiles,
    isLoading,
  };
}
