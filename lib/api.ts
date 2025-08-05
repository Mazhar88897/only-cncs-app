export const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://backend.smartcnc.site/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      // Try to parse error response as JSON, but handle HTML responses gracefully
      let errorData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse error response as JSON:', jsonError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
      } else {
        // Response is not JSON (likely HTML error page)
        const textResponse = await response.text();
        console.error('Server returned non-JSON response:', textResponse.substring(0, 200));
        errorData = { 
          error: `Server error (${response.status}): The server returned an invalid response format. Please try again later.` 
        };
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    // For successful responses, try to parse as JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (jsonError) {
        console.error('Failed to parse success response as JSON:', jsonError);
        throw new Error('Invalid response format from server');
      }
    } else {
      // Response is not JSON but status is ok
      const textResponse = await response.text();
      console.warn('Server returned non-JSON response for successful request:', textResponse.substring(0, 200));
      return { message: 'Request successful' };
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Network error occurred');
    }
  }
}

// Helper functions for common API operations
export const api = {
  post: (endpoint: string, data: any) => 
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  get: (endpoint: string) => 
    apiRequest(endpoint, {
      method: 'GET',
    }),
    
  put: (endpoint: string, data: any) => 
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  delete: (endpoint: string) => 
    apiRequest(endpoint, {
      method: 'DELETE',
    }),
}; 