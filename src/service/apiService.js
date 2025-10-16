// src/service/apiService.js - Frontend API Service

// --- Handle API Responses ---
const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = "Something went wrong";
        try {
            const errorData = await response.json();
            // Prefer message, then error, then fallback
            errorMessage = errorData?.message || errorData?.error || errorMessage;
        } catch {
            // ignore JSON parse error
        }
        throw new Error(errorMessage);
    }
    return response.json();
};

// --- Set Headers (with optional token) ---
const getHeaders = () => {
    const headers = {
        "Content-Type": "application/json",
    };

    const token = localStorage.getItem("token");
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
};

// --- Get Base URL from .env ---
const getBaseUrl = () => {
    return process.env.REACT_APP_API_URL || "http://localhost:4000/api";
};

// --- Main API Service ---
const apiService = {
    get: async (url, config = {}) => {
        try {
            const response = await fetch(`${getBaseUrl()}${url}`, {
                method: "GET",
                headers: getHeaders(),
                ...config,
            });
            return await handleResponse(response);
        } catch (err) {
            throw new Error(err?.message || "Network error while fetching data");
        }
    },

    post: async (url, data, config = {}) => {
        try {
            const response = await fetch(`${getBaseUrl()}${url}`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(data),
                ...config,
            });
            return await handleResponse(response);
        } catch (err) {
            throw new Error(err?.message || "Network error while posting data");
        }
    },

    put: async (url, data, config = {}) => {
        try {
            const response = await fetch(`${getBaseUrl()}${url}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(data),
                ...config,
            });
            return await handleResponse(response);
        } catch (err) {
            throw new Error(err?.message || "Network error while updating data");
        }
    },

    patch: async (url, data, config = {}) => {
        try {
            const response = await fetch(`${getBaseUrl()}${url}`, {
                method: "PATCH",
                headers: getHeaders(),
                body: JSON.stringify(data),
                ...config,
            });
            return await handleResponse(response);
        } catch (err) {
            throw new Error(err?.message || "Network error while patching data");
        }
    },

    delete: async (url, config = {}) => {
        try {
            const response = await fetch(`${getBaseUrl()}${url}`, {
                method: "DELETE",
                headers: getHeaders(),
                ...config,
            });
            return await handleResponse(response);
        } catch (err) {
            throw new Error(err?.message || "Network error while deleting data");
        }
    },
};

export default apiService;