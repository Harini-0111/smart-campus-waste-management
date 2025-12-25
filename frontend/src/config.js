const getApiUrl = () => {
    const url = import.meta.env.VITE_API_URL;
    if (!url && import.meta.env.PROD) {
        console.error('PRODUCTION ERROR: VITE_API_URL is missing. API calls will fail.');
    }
    return url || 'http://localhost:3001/api/v1';
};

export const API_URL = getApiUrl();
