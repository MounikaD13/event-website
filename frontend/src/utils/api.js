import axios from 'axios'

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    console.log(token)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

instance.interceptors.response.use(
    res => res,
    async error => {
        const originalRequest = error.config

        // Retrying on 401 (Standard for Unauthorized/Expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                const { data } = await axios.post(`${BASE_URL}/refresh-token`, {}, {
                    withCredentials: true
                })

                localStorage.setItem("token", data.accessToken)

                // Update header and retry
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
                return instance(originalRequest)
            } catch (err) {
                // If refresh fails, sign out
                localStorage.removeItem("token")
                window.location.href = "/login"
                return Promise.reject(err)
            }
        }
        return Promise.reject(error)
    }
)

export default instance
