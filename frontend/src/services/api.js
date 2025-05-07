import axios from 'axios'

// Notez le préfixe VITE_
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Créer une instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Pour les cookies de session
})

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Service utilisateur
export const userService = {
  register: async (userData) => {
    const response = await api.post('/users', userData)
    return response.data
  },
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials)
    return response.data
  },
  getProfile: async () => {
    const response = await api.get('/users/profile')
    return response.data
  },
}

export default api