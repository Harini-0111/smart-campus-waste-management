const getApiUrl = () => {
    const url = import.meta.env.VITE_API_URL;
    if (import.meta.env.PROD) {
        return url || 'https://smart-campus-waste-management.onrender.com/api/v1';
    }
    return url || 'http://localhost:3001/api/v1';
};

export const API_URL = getApiUrl();
console.log('🌐 EcoCampus API URL:', API_URL);
