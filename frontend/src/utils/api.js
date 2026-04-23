import axios from 'axios'

// Use relative URL so Vite dev-server proxy forwards to backend (no CORS issues)
// Vite proxy: /api/* → http://localhost:5000/api/*
export const BASE_URL = '/api'

const instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

instance.interceptors.response.use(
    res => res,
    async error => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                const { data } = await axios.post('/api/refresh-token', {}, {
                    withCredentials: true
                })

                localStorage.setItem("token", data.accessToken)
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
                return instance(originalRequest)
            } catch (err) {
                localStorage.removeItem("token")
                localStorage.removeItem("eventUser")
                localStorage.removeItem("eventRole")
                window.location.href = "/signin"
                return Promise.reject(err)
            }
        }
        return Promise.reject(error)
    }
)

export default instance
