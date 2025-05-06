import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './services/react-query'

// Pages
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import EmailVerificationPage from './pages/VerifyEmailPage'
import './App.css';
import ForgotPasswordPage from './pages/ForgotPasswordPage'



// Composant pour les routes protégées
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token')
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Route par défaut */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Routes d'authentification */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
       
          {/* Route 404 */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  )
}

export default App