import axios from 'axios';

const apiClient = axios.create({
//    baseURL: 'http://127.0.0.1:8000/',
   baseURL: 'https://signal-analyser-prod-f706849603dd.herokuapp.com/',
})

// Add a request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `JWT ${token}`;
        }    
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error status is 401 and there is no originalRequest._retry flag,
        // it means the token has expired and we need to refresh it
        if (error.response.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true;
         try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await axios.post('/auth/jwt/refresh', { refreshToken });
            const { token } = response.data;
    
            localStorage.setItem('token', token);
    
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `JWT ${token}`;
            return axios(originalRequest);
          } catch (error) {
            // TODO: Handle refresh token error or redirect to login
          }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

// export {CanceledError};